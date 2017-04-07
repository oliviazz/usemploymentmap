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
import csv, json, pprint


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

if __name__ == "__main__":
    create_MSA_map()
