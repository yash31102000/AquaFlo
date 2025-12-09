==========
Order Page
==========
1. Set Filter ✅
2. Give Button according status: ✅
   Pending hoy to confirm and cancel
   Confirm hoy to complete (Check error 500(Item_id))
3. Complete & Confrim order page dessign change: ✅
   1. make table view ✅
   2. create dropdown for discount type fixed and percentage and show each product total in real time ✅
   3. fix width for cell. ✅
   4. fix calculation for per pcs like example price for one product is 100 and discount is 50 after that, those price is calculate
      like (price-discount) * quntity. ✅
   5. price data is right. ✅
   6. tax_amount, total discount and final amount is in table. ✅
   7. Displayed order id and make api call.(Update-order, add-invoice & update-invoice). ✅
   9. Increase cell height of tax_amount and final amount. ✅
   10. Change button name. ✅
   11. Change colour of confirm button to blue and also status. ✅
   12. Create filter for user. ✅
   13. Only price is requried. ✅
   14. Displayed disabled button of completed in gray background. ✅
   15. Set search order by ID. ✅
   16. Create button View Invoice instead of completd button and displayed invoice ✅
   17. Display discount and discount type in order page. ✅
   18. Put three checkbox in view invoce page. ✅

============
Invoice Page
============
1. Create design for invoice page like complete order page. ✅
2. Create design of invoice like that it fit in print option. ✅


##### Set Paggination in all pages ##### ✅

=======
Changes
=======
1. Set dropdown width for user filter. (order page) ✅
   1. user name should be accending order. ✅
   2. in dropdown search filter for user. ✅
2. In user page set search functionality to all table like bootstarp  data  table. (user page) ✅
3. Fix responsive - set icon instead of button in invoice. (invoice page) ✅
4. Create item - fix add image. ✅
5. Create Banner page, add banner page. ✅

========================================================
6. Create home page settings : (set toggle switch) ✅
   1. for banner
   2. for main category
   3. for featured item
   4. for best seller
========================================================

7. Set api call once in add category and add item page for dropdown. ✅
8. Check this error: 
   1. Uncaught Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
   2. @headlessui_react.js?v=611a9d53:2388 A component is changing from uncontrolled to controlled. This may be caused by the value changing from undefined to a defined value, which should not happen. ✅

9. Create edit banner page. ✅
10. Fix api response in edit banner page. ✅
11. Set address list in three column in view user address. ✅
12. Set edit option in category page. ✅
13. Set date filter in order page. ✅
14. Set pdf view for order download. ✅
15. Set category name in invoice view and set bag quntity.
16. set dropdown in tax amount filed in that 0, 9 & 18. ✅
17. per product tax dropdown. ✅
18. delete pop-up in per product.
19. Add item page: set new input fileds like borchure.
20. Set complete status when complete button clicked no view open. ✅
21. Send parameter for per_product_tax & delete product.
22. Change Status confirm to complete in confirm order. & remove Complete button. ✅ 
23. Set table view of product basic data. ✅
24. Set edit table view of product basic data. ✅

============
++++++++++++
============

25. Share map option. (all type) ✅
26. Date filter fix. ✅
27. Disccount type in all order option and by default type is perctange (both option for product and all order). ✅
28. Prodcut ni category display order page ma. ✅
29. Remove discount type and discount from order page. ✅
30. Add basic data in both page. ✅
31. Change name qty to bag qty. ✅
32. Fix invoice api in complete order page. ✅
33. set link in body of mail. ✅
34. dropdwon small karvu bane ek j cell ma. ✅
35. Change in orderpayload: ✅
   type change thay to j send karavnu,
   bag and large bag qunitty hoy to j moklvanu : lage bag calculation = qunitty * (basic item ni large bag) / basi item ni packing 
36. Remove all price in invocie. ✅
37. Test remove product. ✅
38. Remove Discountype, Discount and ID from categories. ✅
39. Add toggle button in categories. ✅
40. Remove extra data and image in invocies and display size, weight, product name and quntity.
41. Add image option in add category and its only visible if value is not selected from dropdown & edit option. ✅
42. Add best seller option in category page. ✅
43. Create design for add item for basic_data and put checkbox for pipes. ✅
44. Set all things are select in add item dropdown.✅
45. PIPES ma Qunitty ma column ma Qunitty (Packing) ---> Data ma basic_data mathi size and inch ✅
46. (quantity * nos)  * weight = ans kg jema nos + weight  made che ane mate ✅
47. (quantity  * weight )  = ans kg jema packing + weight made che ane mate ✅



====================
CHANGES - 21/05/2025
====================
1. Category postion change. (not to implement)
2. Invoice ma indicate karvu nos OR weight. (category+product and niche 63mm - quntity -  weight) ✅
3. Change invoce design to table foramt as bill. ✅
4. Large bag & Packing jema ave ema display karavu & pipes ma qunitty batavi. ✅
5. Bill to, Ship to remove karvu and e part small karvo and invoice compact banavu. ✅
6. Add quntity filed. ✅

7. Create add pricing page for pipes. ✅
8. Set api for basic_data. ✅
API_URL: base_url/pipes/ ✅

=======
Changes
=======
1. Change button hover colour to this #084574.
2. send basic_data_id in order api.
3. add add cloumn option in edit item.


====================
CHANGES - 21/07/2025
====================
1. Fix preview and download PDF buttton. ✅
2. Add add row and remove button in category --> product update. ✅ (add the view , remian from backend)
3. Fix serial number continue in invoice page. ✅
4. Change view of order page to the list and add groub by (filter) in product list ✅
5. Add clone button in category product. ✅ (add the view , remian from backend)
6. Remove kgs/mtr and packing cloumn and add blank box below issued date. ✅
7. Put NOS  beside description.


====================
CHANGES - 01/09/2025
====================
1. Set verify button for user in user page & set background color for not verify. ✅
2. upvc-cpvc ma size batavani & agritech-swr ma mm batavanu fiitings ma order ma. ✅
3. NOS ne description ni baju ma and kgs/mtr vali cloumn kadhi nakhvi. ✅
4. Packing nu packtes karvu. ✅
5. Fitting ma quntity ni jagya e NOS and packets ni jagya e small & large packets: ✅
   NOS - number_of_pic, small beg: bag_quantity , large beg: large_bag_quantity & total: quantity
6. Set PDF view for option 5. ✅
7. Confirm order ma same categories group by karavnu. ✅
8. Added retrieve delete user button in user page. -> API (GET /deleted-user-list/) ✅
9. Add put api for retrieve user. ✅
10. Fix ID value beside product details. ✅
11. Display smallbag and large bag nos in invoice. ✅
12. Display groupby category beside product. ✅
13. Fix dropdown of order page from when user click user order button.



====================
CHANGES - 17/09/2025
====================
1. Add column and add row button in edit product. ✅
2. Add basic data item table in add item page. ✅
3. Remove row button in edit product. ✅