# disruption-map
A map of future disruption in the U.S by major statistical area

## WARNING: under heavy construction

### Todo before 5/8 (!!!)
#### In no particular order

- Add more overlay maps for comparison
- Create charts that correlate disruption with other variables such as employment
- List top 5 disrupted, top 5 opportunity counties
- Create color scale
- Have info about each MSA come up when it is clicked with top industries contributing to disruption in a pop up window
- Create some short human interest narratives to go with correlations

#### Technical Todo

- Continue to clean up code (especially python extraction stuff)

### Components 
1. projected wage
2. projected employment change
3. projected eductation change
4. number of people with job
5. net change

### formula

projeted change in employment * current employment * 
(projected change in wage) * current wage

### How to run

1. Go into project directory
2. start a local server with
```
python -m http.server
```
3.  View in browser by going to localhost:8000

#### To regenerate data

1. modify extract.py as necessary
2. run extract.py

### Screen shots

Opportunity Index:
![di](/img/betteropportunityindex.PNG)


Disruption Index:
![oi](/img/disruptionindex.PNG)
