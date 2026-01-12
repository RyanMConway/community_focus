INSERT INTO communities (name, slug, city, portal_url) VALUES ('The Gables', 'the-gables', 'Durham', 'https://cfnc.cincwebaxis.com') ON CONFLICT (slug) DO NOTHING;

INSERT INTO community_downloads (community_id, title, category, file_url)
SELECT id, 'Bylaws', 'Governing', '/documents/the-gables/bylaws.pdf'
FROM communities WHERE slug = 'the-gables';

INSERT INTO community_docs (community_id, content, created_at)
SELECT id, '[DOCUMENT: Bylaws for The Gables]
', NOW()
FROM communities WHERE slug = 'the-gables';

INSERT INTO community_downloads (community_id, title, category, file_url)
SELECT id, 'Declaration of Covenants (CCRs)', 'Governing', '/documents/the-gables/ccrs.pdf'
FROM communities WHERE slug = 'the-gables';

INSERT INTO community_docs (community_id, content, created_at)
SELECT id, '[DOCUMENT: Declaration of Covenants (CCRs) for The Gables]
', NOW()
FROM communities WHERE slug = 'the-gables';

INSERT INTO community_downloads (community_id, title, category, file_url)
SELECT id, 'Rules & Regulations', 'Governing', '/documents/the-gables/rules-and-regs.pdf'
FROM communities WHERE slug = 'the-gables';

INSERT INTO community_docs (community_id, content, created_at)
SELECT id, '[DOCUMENT: Rules & Regulations for The Gables]
 
 
 
 
THE GABLES UNIT OWNERS ASSOCIATION                 
 
Rules and Regulations 
 
March 2024 
 
 
 
 
 
 
 
 
 
 
 
 
Managed by TRAC Management, LLC * TRAC@tracmanagement.com * 919-612-2032 
 
 
 
 
 
 
  
 
  
2  
  
GENERAL: 
 
1. The Gables is a totally smoke free residence.  This covers the entire footprint of the building, 
including the swimming pool.  The asphalt parking lot located in front of the building is the only 
place Owners, Residents or Guest may smoke.   
2. Suspicious activity should be reported immediately to the Chapel Hill Police Department by calling 
911. 
3. Open flame grills are prohibited inside the footprint of the building or on the decking and patio area 
of the pool.  
4. Hot tubs and waterbeds are prohibited. 
5. All personnel hired by the Board or TRAC Management shall be the responsibility of the Board or 
TRAC Management.  Any related concerns should be directed to the Board or TRAC Management 
for action. 
6. Owners expressly agree to indemnify and save The Gables harmless from any and all loss or 
damage caused by the Owner, the Owners contractors, agents or employees to any portion of the 
common area in the course of the Owner constructing or improving his or her property. The Owner 
further is responsible to cause his contractor, agents and employees to enter into a similar 
agreement with the Owner prior to commencing any construction. The Owner is also required to 
indemnify and save the Association harmless from any and all attorney fees and court costs 
incurred by the Association in enforcing its rights under this clause. 
7. Workmen doing construction, plumbing, HVAC, electrical and moving contractors or delivery of 
appliances or other large items must enter through the garage door, which may remain open while 
in use for these purposes.   
8. Service folks, such as cable, TV, telephone or other repair personnel who need to work in the 
common areas should contact management for access to the building. 
 
 
COMMON AREAS/TRASH/RECYCLING: 
 
1. A trash dumpster is provided for disposal of household trash.  All trash should be bagged and 
securely tied before placing it in the dumpster.  No large items such as furniture should be left in or 
around the dumpster.   
2. Bulk co-mingled recycling bins are provided in the garage area.   
3. Owners and residents must respect areas adjacent to all units. 
4. No sports equipment shall be displayed or erected in a permanent way and no personal items may 
be stored or left overnight in any of the common areas. 
 
MONTHLY MAINTENANCE FEE: 
 
Our main source of operating income is from our monthly maintenance fees.  It is the obligation of every 
Owner to pay the monthly maintenance fee on time.  Direct draft service is available.  Fees are due on the 
first day of the month without notice and are considered late if not paid within fifteen days of the due 
date and will be subject to a $20 late fee each month on each payment.    
  
 
  
3  
 
Make checks payable to Gable UOA and mail to TRAC Management: 
     
 TRAC Management, LLC     
 P.O. Box 3674     
 Chapel Hill, NC 27515    
 
Contact our business office at 919-612-2032 for online payment options. 
 
 
 
ARCHITECTURAL CONTROL - BUILDING AND LANDSCAPE CHANGES: 
 
1. Owners are not permitted to make any additions or changes to any part of the exterior or 
interior of the building unless submitted to the Board and approved in writing as per the Gables 
Declaration of Covenants.  Under no circumstance will a verbal request be considered.  All 
forms and changes are to be submitted to the Board using the Architectural Request Form 
(Exhibit B attached herewith). 
2. No antennas shall be permitted.  Satellite Dishes consistent with the Telecommunications Act 
of 1996, i.e., 21” or less, are acceptable, provided THE BOARD OF DIRECTORS OR PROPERTY 
MANAGER HAS APPROVED THE PLACEMENT PRIOR TO INSTALLATION. 
 
 
 
LANDSCAPE MAINTENANCE: 
 
1. The Association intends to preserve and enhance the appearance of the grounds by providing 
maintenance of the grounds and assuming responsibility for all plantings, unless otherwise noted. 
2. No statuary, fences or other objects are to be placed in the common area or in any green space, 
where they interfere with lawn mower access. 
3. Owners’ concerns regarding the grounds should be directed to the Management Company.  Special 
requests should be made through the Management Company. 
 
 
BUILDING EXTERIORS: 
 
Signs:  
1. No sign shall be placed at The Gables, without written permission of the Board.   
2. For Sale and For Rent signs may be placed on unsold or unoccupied units only. 
3. When selling, only one sign is permitted, and it is to be located on the property for sale.  No other 
sign advertising the property or giving directions to it may be used elsewhere in The Gables. Open 
house signs are permitted, provided that are placed no earlier than one hour prior to and removed 
no later than one hour after the scheduled open house. 
 
  
 
  
4  
Exterior Decorations:  
1. Exterior decorations shall be limited, modest, and unobtrusive and must be placed on the Owner’s 
property only and not on common property.  This includes holiday decorations, which must be 
removed immediately after the holiday season. 
 
 
 
 
RENTAL OF PROPERTY:   
 
The Gables is a private residential community of single-family condominiums.  While renting for any 
reason is discouraged, the Board recognizes that personal circumstances do change, and Owners may 
find themselves contemplating renting their units for a period of time.  Before making the decision to 
rent and certainly before having a rental agreement drawn up, Owners need to be aware of the 
following: 
 
1. A copy of the executed lease and rental information form (Exhibit A furnished by The Gables 
Property Management firm) must be submitted to the Board of Directors before the property is 
occupied.  
2. The lease should address these matters of interest to the Homeowners Association: 
a. The right of the Association to enforce the governing documents and more specifically the 
rules and regulation against both Owner and Tenant.  The Owner is responsible for 
supplying the Tenant with a copy of these prior to signing. 
b. The responsibility of both Owner and Tenant to maintain the property and common areas, 
in keeping with the Association’s governing documents. 
c. The liability of the Owner and Tenant for any damage to property and common areas 
owned by the Association. 
d. The responsibility of Owner to pay all Homeowner dues and assessments, regardless of 
what arrangement the Owner and Tenant may make between themselves. 
e. A provision prohibiting subletting. 
f. No more than two unrelated persons can occupy a unit. 
 
   
VEHICLES AND PARKING: 
 
1. Parking is permitted only in areas marked for that purpose.   
2. No unlicensed and/or inoperable vehicle can be operated or stored in The Gables. 
3. PARKING SPACE RIGHTS:   Ownership of each condominium shall entitle the Owner or Resident 
thereof to the use of the marked space(s) provided in the garage.  Additional parking for owners, 
residents, invited guests and service vehicles is provided in the surface lot along the front of the 
property. 
4. Automotive repairs, including but not limited to oil changes, are prohibited. 
5. The Board of Directors reserves the right to enforce towing, at the expense of the Owner or 
Residents, for any parking violation. 
  
 
  
5  
 
 
PETS: 
 
No animal of any type shall be raised, bred or kept in any Unit or in any Common Area or Facility except 
that dogs and cats (not exceeding forty (40) pounds mature weight) and other animals owned commonly 
as household pets may be kept in Units subject, however, to the strict adherence of rules and regulations 
adopted by the Association. There is a limit of two pets per unit. 
  
1. All animals must be vaccinated and properly licensed with the Town of Chapel Hill. 
2. Animals are to be walked on leashes. The curbing of pets is prohibited in all grassy and landscaped 
areas.  Owners MUST clean up immediately after their pets in ALL areas. 
3. Animals may not be tied or staked outside or left on patios unless in direct view of the Owner.  
Barking or other noises made by pets must not interfere with others’ rights to reasonable 
enjoyment of their homes.  Such noises constitute a nuisance under the Orange County Animal 
Control Ordinance and will be reported. 
4. The breeding of animals for commercial purposes is not permitted. 
5. The Board of Directors shall have the right to order any person whose pet is a nuisance and who 
does not comply with the above rules to remove such pet from the premises. 
  
 
 
USE OF GRILL and GRILL AREA: 
 
1. No use of the area is allowed after 10 pm 
2. No glass containers or bottles of any kind are allowed. 
3. No smoking allowed. 
4. Owner/Resident must be present when grill is in use 
5. Parties are limited to Owner/Resident and four guests unless approved otherwise by the Board. 
6. User is responsible for cleaning the area and grill as well as all trash removal/proper disposal 
7. Other Rules of the pool area (listed in the Rules and Regulations) are in force at all times. 
8. A grill user should read the instruction booklets located inside the grill housing. 
9. Grill cleaning tools are located inside the grill housing. 
10. Once the grill has cooled and been cleaned, user should cover the grill with the black grill cover. 
 
 
 
 
 
 
 
 
 
 
  
 
  
6  
POOL: 
 
1. The pool is for the exclusive use of the Gables Units Owners, Residents and their invited guests 
only.  Invited guests must be limited to a maximum of 4 at any given time. 
2. The Owner or Resident must accompany invited guests, other than overnight houseguests. 
3. Lifeguards are not provided at the pool.  Extreme caution is recommended at all times. Parents are 
responsible for the safety and conduct of their children. 
4. Parents or a responsible adult must accompany children under 13 years old. 
5. No horseplay is allowed in or around the pool area.   
6. No glass containers of any kind or bottles are permitted in pool area. 
7. Alcoholic beverages and/or smoking in or around the pool area is prohibited. 
8. Radios or music should be kept at a low volume so as not to disturb others. 
9. Showers are to be taken before using the pool. 
10. Team or group activities (volleyball, etc.) in or around the pool are prohibited. 
11. The pool hours shall be from Sunrise until 10:00 PM, seven days a week. 
12. Swimming attire must be worn at all times. 
13. Residents and their guests shall abide by any additional rules posted in the pool area. 
 
 
 
Any Owner or Resident found in violation of any of these rules and regulations will be notified in 
writing prior to any fines or remedies by The Gables Board of Directors. 
 
IN ADDITION, THE GABLES BOARD OF DIRECTORS MAY IMPOSE FINANCIAL PENALTIES, AS SET FORTH 
IN THE NORTH CAROLINA GENERAL STATUE:  47C – 3 – 102, SECTION a (11). 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
  
 
  
7  
 
 
Exhibit “A” 
 
The Gables Homeowners Association 
Rental Information Form 
 
For: Unit #  ________   The Gables 
 
 
Owner’s Name  ____________________________________________________________________ 
 
 
Owner’s Address:  __________________________________________________________________ 
 
City: ___________________________________   State:  __________   Zip:  _____________________ 
 
 
Phone:  (Home)  __________________________   (Work) ______________________________  
 
  (Mobile)  _________________________    
 
  (Email)  ________________________________________________________________ 
 
 
Tenant’s Name  ____________________________________________________________________ 
 
 Phone: (Home)  _________________   (Work) ____________________  (Mobile)  ___________________    
 
  (Email)  _______________________________________________________________ 
 
Lease Terms: ________________________________________________________________________ 
                            (Month)          (Day)          (Year)          to           (Month)          (Day)           (Year) 
 
Name Of Other Occupants:  _____________________________________________________________ 
 
Emergency Contact: (Name & Phone) ____________________________________________________ 
 
Vehicle #1: 
License Plate: __________________________     Type Vehicle: ________________________________ 
 
Vehicle #2: 
License Plate: __________________________     Type Vehicle: ________________________________ 
 
Management Company (If applicable)_________________________________________________ 
 
  Phone:   (Work) _______________________   Facsimile:_________________________ 
', NOW()
FROM communities WHERE slug = 'the-gables';