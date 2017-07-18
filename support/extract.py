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
import csv, json, xlrd,  os.path 


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

    # percentage change in employemnt by occupationn code

    # total projections for each occupation 
    occupation_projections = {}
    # maps a numerical code to occupation string 
    occupation_names = {}

    # disruption index by MSA code
    disruption_index = {}
    # opportunity index by MSA code
    opportunity_index = {}
    # combined index by MSA code
    combined_index = {}

    # total employment by MSA code
    employment_in_MSA = {}
    opp = {}
    dis = {}
     
    # msa data for all jobs; first level = keys by Job ; second level = keys by MSA 
    jobs_by_MSA = {}
    # maps employment code to the text 
    job_emp_code_to_text = {}


    # top contributor to disruption/combined/opportunity by occupation code
    topjobchange = {
        "Combined" : {},
        "Opportunity": {},
        "Disruption" : {}
    }

    # occupation projections tracks the projections for each employment code 
    # occupation_names provides the corresponding name given a code 
    assert os.path.isfile('occupation.xlsx')
###############################################################################
    book = xlrd.open_workbook("occupation.XLSX")
    sheet = book.sheet_by_index(2)

    """ record percentage change for each employment emp_code """
    for i in range(4, sheet.nrows):
        emp_code = sheet.cell_value(i, 1)
        occupation_names[emp_code] = sheet.cell_value(i, 0) 
        percentChange = sheet.cell_value(i, 8)
        occupation_projections[emp_code] = percentChange


##########

# def record_employment
###############################################################################
    # Use employment data for each MSA to create opportunity, disruption values 
    book = xlrd.open_workbook("MSA_M2016_dl.xlsx")
    sheet = book.sheet_by_index(0)

    for i in range(1, sheet.nrows): 
        msa = sheet.cell_value(i, 1)
        cur_employment_code = sheet.cell_value(i, 3)
        emp_in_sector = sheet.cell_value(i, 6) # for a given msa 
        is_major_emp = (sheet.cell_value(i, 5) == "major")
   

        if cur_employment_code not in occupation_projections:
            continue
        if cur_employment_code == "00-0000" and msa not in employment_in_MSA:
            employment_in_MSA[msa] = float(emp_in_sector)
            continue
        if emp_in_sector == "**" or emp_in_sector == "*" or emp_in_sector == "***":
            emp_in_sector = 0
        
        
        # If it is a major employment, update the employment in job for that msa in jobs_by_MSA
        if is_major_emp: 
            if not cur_employment_code in jobs_by_MSA: #if that job hasn't been added yet  
                jobs_by_MSA[cur_employment_code] = {};

            # this is a dictionary for a given job
            job_employment_by_msa = jobs_by_MSA[cur_employment_code]; 

            if not msa in job_employment_by_msa:
                job_employment_by_msa[msa] = emp_in_sector;  


        if msa not in disruption_index:
            disruption_index[msa] = 0
            opportunity_index[msa] = 0
            combined_index[msa] = 0

        proj_job_change = emp_in_sector*float(occupation_projections[cur_employment_code]);
           
        if proj_job_change < 0:
            disruption_index[msa] += abs(proj_job_change)
        elif proj_job_change > 0:
            opportunity_index[msa] += abs(proj_job_change)

        combined_index[msa] += abs(proj_job_change)

        kinds_of_maps = {"Disruption", "Opportunity", "Combined"}
         
        for kind in kinds_of_maps: 
            if not msa in topjobchange[kind] and is_major_emp:
                    topjobchange[kind][msa] = cur_employment_code
            elif msa in topjobchange[kind]:
                standing_top_job = topjobchange[kind][msa]
                proj = occupation_projections[standing_top_job]
                standing_top_effect = proj*jobs_by_MSA[standing_top_job][msa]

                if abs(proj_job_change) > abs(standing_top_effect):
                    topjobchange[kind][msa] = cur_employment_code
    
     
##########################################################################################################
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
            if  emp_in_sector*float(occupation_projections[emp_code]) > emp_in_sector*float(occupation_projections[topjobchange["Combined"][msa]]):
                topjobchange["Combined"][msa] = emp_code

            if float(occupation_projections[emp_code]) < 0:
                disruption_index[msa] += abs(emp_in_sector*float(occupation_projections[emp_code]))
                if emp_in_sector*float(occupation_projections[emp_code]) < emp_in_sector*float(occupation_projections[topjobchange["Disruption"][msa]]):
                    topjobchange["Disruption"][msa] = emp_code
            else:
                opportunity_index[msa] += abs(emp_in_sector*float(occupation_projections[emp_code]))
                if emp_in_sector*float(occupation_projections[emp_code]) > emp_in_sector*float(occupation_projections[topjobchange["Opportunity"][msa]]):
                    topjobchange["Opportunity"][msa] = emp_code

        else:
            
            topjobchange["Combined"][msa] = emp_code
            topjobchange["Disruption"][msa] = emp_code
            topjobchange["Opportunity"][msa] = emp_code

            combined_index[msa] = emp_in_sector*float(occupation_projections[emp_code]) 
            if float(occupation_projections[emp_code]) < 0:
                disruption_index[msa] = abs(emp_in_sector*float(occupation_projections[emp_code]))
                opportunity_index[msa] = 0
            else:
                opportunity_index[msa] = abs(emp_in_sector*float(occupation_projections[emp_code]))
                disruption_index[msa] = 0

    msa_as_key = {}
    # Now, make the msas the keys for easier iteration
    projforJobs = {}
    for job in jobs_by_MSA:
        for msa in jobs_by_MSA[job]:
            if (msa not in msa_as_key):
                msa_as_key[msa] = {}
            if (msa not in projforJobs):
                projforJobs[msa] = {}

            if jobs_by_MSA[job][msa] == "**" or jobs_by_MSA[job][msa]== "*" or jobs_by_MSA[job][msa] == "***":
                emp_in_msa_job = 0;
            else: 
                emp_in_msa_job = float(jobs_by_MSA[job][msa])
            print(emp_in_msa_job)
            msa_as_key[msa][job] = emp_in_msa_job
            projforJobs[msa][job] = (emp_in_msa_job)*float(occupation_projections[job]);

    for msa in disruption_index:
        opp[msa] = opportunity_index[msa]
        dis[msa] = disruption_index[msa]
        disruption_index[msa] /= employment_by_MSA[msa]
        opportunity_index[msa] /= employment_by_MSA[msa]
        combined_index[msa] /= employment_by_MSA[msa]




    with open('../data/job_employments.csv', 'w') as outfile:
        writer = csv.DictWriter(outfile, fieldnames = (["MSA"] + jobs_by_MSA.keys() + ["proj"]))  
        writer.writeheader()

        for msa in msa_as_key:
            jobs = msa_as_key[msa]
            projection = employment_by_MSA[msa]*float(occupation_projections[emp_code]) 
            writer.writerow(dict({"MSA":msa}, **jobs))

    with open('../data/proj.csv', 'w') as outfile:
         writer = csv.DictWriter(outfile, fieldnames = (["MSA"] + jobs_by_MSA.keys()))  
         writer.writeheader()

         for msa in msa_as_key:
            msaProj = projforJobs[msa];
            writer.writerow(dict({"MSA":msa}, **msaProj))
         
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

    with open('../data/disruption.csv', 'w') as outfile:

        writer = csv.DictWriter(outfile, 
            fieldnames=['area','disruption', 'greatest_sector', 
                        'totaldisrupt', 'dis', 'totalEmployed'])  
        writer.writeheader()
        for area in disruption_index:
           
            topjob = topjobchange['Disruption'][area]
            topjobname = occupation_names[topjob]

            writer.writerow({
                'area' : area,
                'disruption' : disruption_index[area],
                'greatest_sector' : topjobname,
                'dis': dis[area], 
                'totalEmployed': employment_by_MSA[area]
            })

    with open('../data/opportunity.csv', 'w') as outfile:
        writer = csv.DictWriter(outfile, 
            fieldnames=['area','opportunity','greatest_sector', 
                         'opp','totalEmployed'])  
        writer.writeheader()
        for area in disruption_index:
            writer.writerow({
                'area' : area, 
                'opportunity' : opportunity_index[area], 
                'greatest_sector' : occupation_names[topjobchange['Opportunity'][area]],
                'opp': opp[area], 
                'totalEmployed': employment_by_MSA[area]
            })

    with open('../data/combined.csv', 'w') as outfile:
        writer = csv.DictWriter(outfile, 
            fieldnames=['area','combined', 'greatest_sector'])  
        writer.writeheader()
        for area in disruption_index:
            writer.writerow({
                'area' : area,
                'combined' : combined_index[area],
                'greatest_sector' : occupation_names[topjobchange['Combined'][area]]})


if __name__ == "__main__":

    create_tables()

