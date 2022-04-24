/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['knockout',                     
        'ojs/ojcollectiondataprovider',                
        'ojs/ojarraydataprovider',
        'ojs/ojarraytabledatasource',
        'ojs/ojpagingcontrol',        
        'ojs/ojinputtext','ojs/ojlistview',
        'ojs/ojlabel','ojs/ojlabelvalue','ojs/ojbutton','ojs/ojselectcombobox',
        'ojs/ojconveyorbelt'
        ],
        
 function(ko, CollectionDataProvider, ArrayDataProvider) {

    function DashboardViewModel() {        
        
        var self = this;       
          
        self.value1 = ko.observable('CH'); 
        
        self.selectedTabItem = ko.observable();
        
        self.scrollPos = ko.observable({ y: 0 });
        self.scrollPosDetail = ko.observable();
        
        self.handleScrollPositionChanged = function (event) {
            var value = event.detail.value;
            self.scrollPosDetail('x: ' + Math.round(value.x) + ' y: ' + Math.round(value.y) + ' key: ' + value.key + ' index: ' + value.index + ' offsetX: ' + Math.round(value.offsetX) + ' offsetY: ' + Math.round(value.offsetY));
        }.bind(self);
        
        /* Variables */        
        //self.selectedTabItem = ko.observable("settings");
        //self.backTestListDataSource = ko.observable();
        self.selectedCategory = ko.observable();
        self.selectedCategoryModel = ko.observable();
        self.categoryList = ko.observable();
        
        self.selectionRequired = ko.observable(false);
        
        self.categoryListDataSource = ko.computed(function () {
           /* List View Collection and Model */
            var categoryModelItem = oj.Model.extend({
                idAttribute: 'id'
            });

            var categoryListCollection = new oj.Collection(null, {
                url: "http://dnssemantikos:8080/ws/rest/categories/",
                model: categoryModelItem
            });                          

            self.categoryList = ko.observable(categoryListCollection);  

            //self.backTestListDataSource(new oj.CollectionTableDataSource(self.backTestList()));   
            //return new PagingDataProviderView(new CollectionDataProvider(self.backTestList()));
            return new CollectionDataProvider(self.categoryList());
        });                              
                
        /* List selection listener */        
        self.categoryListSelectionChanged = function () {                                               
            
            self.selectionRequired(false);
                        
            self.selectedCategoryModel(self.categoryList().get(self.selectedCategory()));                        
                                                              
            // Check if the selected ticket exists within the tab data
            var match = ko.utils.arrayFirst(self.tabData(), function (item) {
              return item.id === self.selectedCategory();
            });
            
            console.log(JSON.stringify(self.selectedCategoryModel()));

            if (!match) { 
                while(self.tabData().length > 0) {                    
                    self.tabData.pop();
                }                
                self.tabData.push({
                  "name": self.categoryList().get(self.selectedCategory()).get("name"),
                  "id": self.selectedCategory()
                });
            }
            
            self.selectedTabItem(self.selectedCategory());                        
        };  
        
        
        /* Tab Component */
        self.tabData = ko.observableArray([]);
        self.tabBarDataSource = new oj.ArrayTableDataSource(self.tabData, { idAttribute: 'id' });

        self.deleteTab = function (id) {                        
            
            // Prevent the first item in the list being removed
            //if(id != self.backTestList().at(0).id){          
            if(self.tabData.length > 1) {

              var hnavlist = document.getElementById('ticket-tab-bar'),
                items = self.tabData();
              for (var i = 0; i < items.length; i++) {
                if (items[i].id === id) {
                  self.tabData.splice(i, 1);

                 /* Check if the current selected list item matches the open tab,
                    if so, reset to the first index in the list
                  */
                  if(id === self.selectedBackTest() || self.selectedBackTest() !== self.selectedTabItem()){                         
                        self.selectedTabItem(self.tabData()[0].id);
                  }

                  oj.Context.getContext(hnavlist)
                    .getBusyContext()
                    .whenReady()
                    .then(function () {
                      hnavlist.focus();
                    });
                  break;
                }
              }
            }
        };

        self.onTabRemove = function (event) {
            self.deleteTab(event.detail.key);
            event.preventDefault();
            event.stopPropagation();
        };

        self.tabSelectionChanged = function () {               
            self.selectedCategoryModel(self.categoryList().get(self.selectedTabItem()));            
        } 
        
    }      

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return DashboardViewModel;
  }
);
