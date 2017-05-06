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
index counties by FIPS emp_code (FIPS state emp_code plus county emp_code) and map that to county name
and map it to MSA emp_code   

"""
import csv, json, xlrd

"""
creates a json file that maps MSA emp_codes to counties
"""
def create_MSA_map():
    msa_map = {}

    with open('area_definitions_m2016.csv', encoding='latin_1') as csvfile:
        reader = csv.DictReader(csvfile) 
        for row in reader:
            countyemp_Code = row['FIPS emp_code']+ row['County emp_code']
            msaemp_Code = row['MSA emp_code (including MSA divisions)'];
            if msaemp_Code in msa_map:
                msa_map[msaemp_Code].append(countyemp_Code)
            else:
                msa_map[row['MSA emp_code (including MSA divisions)']] = [countyemp_Code]

    with open('../data/us_msa.json', 'w') as jsonfile:
       json.dump(msa_map, jsonfile) 


def create_tables():

    occupation_projections = {}
    disruption_index = {}
    employment_by_MSA = {}
    opportunity_index = {}
    combined_index = {}
    topjobchange = {}
    jobs_by_MSA = {}
    job_emp_code_to_text = {}


    book = xlrd.open_workbook("occupation.XLSX")
    sheet = book.sheet_by_index(2)

    # record percentage change for each employment emp_code 
    for i in range(4, sheet.nrows):
        # occupation emp_code 
        emp_code = sheet.cell_value(i, 1)
        percentChange = sheet.cell_value(i, 8)
        occupation_projections[emp_code] = percentChange

    # Use employment data for each MSA to create opportunity, disruption values 
    book = xlrd.open_workbook("MSA_M2016_dl.xlsx")
    sheet = book.sheet_by_index(0)

    for i in range(1, sheet.nrows):
        msa = sheet.cell_value(i, 1)
        emp_code = sheet.cell_value(i, 3)
        emp_in_sector = sheet.cell_value(i, 6)
        isMajor = (sheet.cell_value(i, 5) == "major")
        

        if (isMajor): 
            if (emp_code not in jobs_by_MSA):
                jobs_by_MSA[emp_code] = {};

            empInJob = jobs_by_MSA[emp_code];
            if (msa not in empInJob):
                empInJob[msa] = emp_in_sector;
        
        #empInJob is a dictionary 
        # Record employment for a job in each MSA 
        
        

        if emp_code not in occupation_projections:
            continue

        if emp_in_sector == "**" or emp_in_sector == "*" or emp_in_sector == "***":
            emp_in_sector = 0

        #  00 0000 is the for the total for that MSA
        if emp_code == "00-0000" and msa not in employment_by_MSA:
            employment_by_MSA[msa] = float(emp_in_sector)
            continue

        if msa in disruption_index:
            val = emp_in_sector*float(occupation_projections[emp_code]);
            if (msa in topjobchange and val > topjobchange[msa][0]):
                tempValue = (val, sheet.cell_value(i, 4));
                topjobchange[msa] = tempValue;

            if (not msa in topjobchange):
                tempValue = (val, sheet.cell_value(i, 4));
                topjobchange[msa] = tempValue;

            combined_index[msa] += emp_in_sector*float(occupation_projections[emp_code]) 
            if float(occupation_projections[emp_code]) < 0:
                disruption_index[msa] += abs(emp_in_sector*float(occupation_projections[emp_code]))
            else:
                opportunity_index[msa] += abs(emp_in_sector*float(occupation_projections[emp_code]))
        else:
            combined_index[msa] = emp_in_sector*float(occupation_projections[emp_code]) 
            if float(occupation_projections[emp_code]) < 0:
                disruption_index[msa] = abs(emp_in_sector*float(occupation_projections[emp_code]))
                opportunity_index[msa] = 0
            else:
                opportunity_index[msa] = abs(emp_in_sector*float(occupation_projections[emp_code]))
                disruption_index[msa] = 0

    # Do the same for non-metropolitan areas 
    book = xlrd.open_workbook("BOS_M2016_dl.xlsx")
    sheet = book.sheet_by_index(0)

    for i in range(1, sheet.nrows):
        msa = sheet.cell_value(i, 1)
        emp_code = sheet.cell_value(i, 3)
        emp_in_sector = sheet.cell_value(i, 6)
        isMajor = sheet.cell_value(i, 5) == "major";
        #@ to do make a function that maps from occupation emp_code to text description
        # for now the keys will be emp_coded as the emp_code 

        
        if (isMajor): 
            if (emp_code not in jobs_by_MSA):
                jobs_by_MSA[emp_code] = {};

            empInJob = jobs_by_MSA[emp_code];
            if (msa not in empInJob):
                empInJob[msa] = emp_in_sector;

        
        if emp_code not in occupation_projections:
            continue

        if emp_in_sector == "**" or emp_in_sector == "*" or emp_in_sector == "***":
            emp_in_sector = 0

        #  00 0000 yields total number of people employed in an MSA 
        if emp_code == "00-0000" and msa not in employment_by_MSA:
            employment_by_MSA[msa] = float(emp_in_sector)
            continue

        if msa in disruption_index:
            combined_index[msa] += emp_in_sector*float(occupation_projections[emp_code]) 
            if float(occupation_projections[emp_code]) < 0:
                disruption_index[msa] += abs(emp_in_sector*float(occupation_projections[emp_code]))
            else:
                opportunity_index[msa] += abs(emp_in_sector*float(occupation_projections[emp_code]))
        else:
            combined_index[msa] = emp_in_sector*float(occupation_projections[emp_code]) 
            if float(occupation_projections[emp_code]) < 0:
                disruption_index[msa] = abs(emp_in_sector*float(occupation_projections[emp_code]))
                opportunity_index[msa] = 0
            else:
                opportunity_index[msa] = abs(emp_in_sector*float(occupation_projections[emp_code]))
                disruption_index[msa] = 0

    msa_as_key = {}
    # Now, make the msas the keys for easier iteration

    for job in jobs_by_MSA:
        for msa in jobs_by_MSA[job]:
            if (msa not in msa_as_key):
                msa_as_key[msa] = {}

            emp_in_msa_job = jobs_by_MSA[job][msa]
            msa_as_key[msa][job] = emp_in_msa_job

    for msa in disruption_index:
        disruption_index[msa] /= employment_by_MSA[msa]
        opportunity_index[msa] /= employment_by_MSA[msa]
        combined_index[msa] /= employment_by_MSA[msa]

    with open('../data/job_employments.csv', 'w') as outfile:
        writer = csv.DictWriter(outfile, fieldnames = (["MSA"] + jobs_by_MSA.keys()))  
        writer.writeheader()

        for msa in msa_as_key:
            jobs = msa_as_key[msa]
            writer.writerow(dict({"MSA":msa}, **jobs))
         
# Commented out because these are already created! 

    # with open('../data/disruption.csv', 'w') as outfile:
    #     writer = csv.DictWriter(outfile, fieldnames=['area','disruption'])  
    #     writer.writeheader()
    #     for area in disruption_index:
    #         writer.writerow({'area' : area, 'disruption' : disruption_index[area]})

    # with open('../data/opportunity.csv', 'w') as outfile:
    #     writer = csv.DictWriter(outfile, fieldnames=['area','opportunity'])  
    #     writer.writeheader()
    #     for area in disruption_index:
    #         writer.writerow({'area' : area, 'opportunity' : opportunity_index[area]})

    # with open('../data/combined.csv', 'w') as outfile:
    #     writer = csv.DictWriter(outfile, fieldnames=['area','combined', 'greatest_sector'])  
    #     writer.writeheader()
    #     for area in disruption_index:
    #         if (area not in topjobchange):
    #             writer.writerow({'area' : area, 'combined' : combined_index[area], 'greatest_sector' : "--"})
    #         else:
    #             writer.writerow({'area' : area, 'combined' : combined_index[area], 'greatest_sector' : topjobchange[area][1]})

if __name__ == "__main__":

    create_tables()

