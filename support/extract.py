"""
Author: Lucas Manning

Description: Script for extracting data from raw BLS excel files,
             doing the disruption calculations, and saving the
             output as a csv.

Algorithm:

for each Metropolotain or non metropolitan area:

    for each major industry in ihe area:
        1. compute the disruption index
        2. add it to a table.

1. save table
2. create csv indexed by state with average disruption across each industry
3. create csv indexed by industry with avaerage disuption

create json file with msa mapped to fipskj
index counties by FIPS code (FIPS state code plus county code) and map that to county name
and map it to MSA code   

"""
import csv, json, xlrd

"""
creates a json file that maps MSA codes to counties
"""
def create_MSA_map():
    msa_map = {}

    with open('area_definitions_m2016.csv', encoding='latin_1') as csvfile:
        reader = csv.DictReader(csvfile) 
        for row in reader:
            countyCode = row['FIPS code']+ row['County code']
            msaCode = row['MSA code (including MSA divisions)'];
            if msaCode in msa_map:
                msa_map[msaCode].append(countyCode)
            else:
                msa_map[row['MSA code (including MSA divisions)']] = [countyCode]

    with open('../data/us_msa.json', 'w') as jsonfile:
       json.dump(msa_map, jsonfile) 

def create_disruption_index():
    occupation_projections = {}
    disruption_index = {}
    employment_totals = {}

    book = xlrd.open_workbook("occupation.XLSX")
    sheet = book.sheet_by_index(2)

    for i in range(4, sheet.nrows):
        code = sheet.cell_value(i, 1)
        percentChange = sheet.cell_value(i, 8)
        occupation_projections[code] = percentChange

    book = xlrd.open_workbook("MSA_M2016_dl.xlsx")
    sheet = book.sheet_by_index(0)

    for i in range(1, sheet.nrows):
        msa = sheet.cell_value(i, 1)
        code = sheet.cell_value(i, 3)
        tot_emp = sheet.cell_value(i, 6)

        if code not in occupation_projections:
            continue

        if tot_emp == "**" or tot_emp == "*" or tot_emp == "***":
            tot_emp = 0

        if code == "00-0000" and msa not in employment_totals:
            employment_totals[msa] = int(tot_emp)
            continue

        if msa in disruption_index:
            disruption_index[msa] += abs((tot_emp /  int(employment_totals[msa]))*int(occupation_projections[code]))
        else:
            disruption_index[msa] = abs(tot_emp / int(employment_totals[msa])*int(occupation_projections[code]))


    book = xlrd.open_workbook("BOS_M2016_dl.xlsx")
    sheet = book.sheet_by_index(0)

    for i in range(1, sheet.nrows):
        msa = sheet.cell_value(i, 1)
        code = sheet.cell_value(i, 3)
        tot_emp = sheet.cell_value(i, 6)

        if code not in occupation_projections:
            continue

        if tot_emp == "**" or tot_emp == "*" or tot_emp == "***":
            tot_emp = 0

        if code == "00-0000" and msa not in employment_totals:
            employment_totals[msa] = int(tot_emp)
            continue

        if msa in disruption_index:
            disruption_index[msa] += (tot_emp /  int(employment_totals[msa]))*int(occupation_projections[code])
        else:
            disruption_index[msa] = tot_emp / int(employment_totals[msa])*int(occupation_projections[code])


    for msa in disruption_index:
        disruption_index[msa] /= len(occupation_projections) 

    with open('../data/disruption.csv', 'w') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=['area','disruption'])  
        writer.writeheader()
        for area in disruption_index:
            writer.writerow({'area' : area, 'disruption' : disruption_index[area]})



if __name__ == "__main__":
    create_disruption_index()
