/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * backtest module
 */
define(['knockout', 
        'ojs/ojarraydataprovider',     
        "ojs/ojlistdataproviderview",  
        "ojs/ojdataprovider",
        "ojs/ojselectsingle",
        'ojs/ojinputtext',
        "ojs/ojradioset",
        'ojs/ojbufferingdataprovider',
        'ojs/ojarraytabledatasource',                
        'ojs/ojtable',
        'ojs/ojbutton',
        'ojs/ojselectcombobox',
        'ojs/ojlistitemlayout',        
        'ojs/ojformlayout',
        'ojs/ojknockout-validation'],                 
function (ko, ArrayDataProvider, ListDataProviderView, ojdataprovider_1, AsyncRegExpValidator) {
    /**
     * The view model for the main content view template
     */        
    function descriptionsContentViewModel(params) {
        
        var self = this;        
             
        self.name = ko.observable();
        
        /* Variables */
        self.id = ko.observable(1);
        
        self.sensibility = ko.observable("false");
        self.term = ko.observable("");   
        self.descriptionType = ko.observable();
        
        self.editedData = ko.observable("");
        
        self.dataDescriptionTypes = ko.observableArray();                
        
        self.dataDescriptions = ko.observableArray();  
        
        self.filter = ko.observable("");
        
        self.editRow = ko.observable();
        
        self.descriptionTypes = ko.computed(function () {                        
          
            $.getJSON("http://dnssemantikos:8080/ws/rest/descriptions/descriptionTypes/").
                then(function (descriptionTypes) {                                        
                    self.dataDescriptionTypes(descriptionTypes);   
            });                        
                               
            return new ArrayDataProvider(
                self.dataDescriptionTypes,
                {idAttribute: 'id'}
            ); 
            
        });
        
        self.datasource = ko.computed(function () {      
            
            console.log(params.conceptModel());
            
            self.sensibility("false");
            self.term("");   
            self.descriptionType(null);
            
            let filterCriterion = null;  
            
            if(params.conceptModel() !== "undefined") {
                
                self.dataDescriptions(params.conceptModel().validDescriptionsButFSNandFavorite);                                           

                if (self.filter() && self.filter() != "") {
                    filterCriterion = ojdataprovider_1.FilterFactory.getFilter({
                        filterDef: { text: self.filter() },                    
                        //filterOptions: {textFilterAttributes: ["client"]}
                    });                
                }   
                
            }                                             
                       
            const arrayDataProvider = new ArrayDataProvider(
                self.dataDescriptions(),
                {idAttribute: 'id'}
            ); 
    
            //console.log(self.data());

            return new ListDataProviderView(arrayDataProvider, {filterCriterion: filterCriterion});
                                            
            //return new BufferingDataProvider(arrayDataProvider);
            
            /*
            self.datasource = new BufferingDataProvider(new oj.ArrayDataProvider(
                self.data,
                {idAttribute: 'id'}
            )); 
            */                                          
            
        });    
        
        self.getItemText = function (itemContext) {
            console.log(itemContext);
            return itemContext.data.name;
        };
        
        self.beforeRowEditListener = (event) => {
              self.cancelEdit = false;
              const rowContext = event.detail.rowContext;
              //console.log(rowContext.status);
              //console.log(self.data()[rowContext.status.rowIndex]);             
              
              console.log(rowContext.item.data);
              
              self.originalData = Object.assign({}, rowContext.item.data);
              self.rowData = Object.assign({}, rowContext.item.data);
              
              console.log(self.rowData);
        };
        
        // handle validation of editable components and when edit has been cancelled
        self.beforeRowEditEndListener = (event) => {
            console.log(event);
            self.editedData("");            
            const detail = event.detail; 
            if (!detail.cancelEdit && !self.cancelEdit) {
                if (self.hasValidationErrorInRow(document.getElementById("table"))) {
                    event.preventDefault();
                }
                else {
                    if (self.isRowDataUpdated()) {
                        const key = detail.rowContext.status.rowIndex;
                        self.submitRow(key);
                    }
                }
            }
        };
        
        self.addRow = (key) => {                                       
                 
            console.log(key);   
            
            let element3 = document.getElementById("descriptionTypePlaceHolder");
            let element4 = document.getElementById("termPlaceHolder");                                    
                                                           
            element3.validate().then((result3) => {                
                element4.validate().then((result4) => { 
                    
                    if(result3 === 'invalid' || result4 === 'invalid') {
                        return false;
                    }
                    
                    var description = {};

                    description.id = self.getRndInteger(1000,100000);
                    description.caseSensitive = self.sensibility();
                    description.term = self.term();
                    description.descriptionType = self.getDescriptionTypeById(self.descriptionType());   

                    var result = self.itemExists(description);

                    if (!result) {
                        params.conceptModel().validDescriptionsButFSNandFavorite.push(description);           
                        self.dataDescriptions(params.conceptModel().validDescriptionsButFSNandFavorite);                        
                        self.clearPlaceHolders();
                    }
                    else {
                        alert("ya existe una descripción con estas características");
                    }                              

                    console.log(JSON.stringify(self.getDescriptionTypeById(self.descriptionType()))); 
                });
            }); 
            
            //console.log(JSON.stringify(params.conceptModel().validDescriptionsButFSNandFavorite));
        };
        
        self.clearPlaceHolders = () => {
            self.sensibility("false");
            self.term("");
            self.descriptionType(null);
        }       
        
        self.itemExists = (data) => {
            var result = false;
            
            $(self.dataDescriptions()).each(function(key,value) { 
                console.log("value = " + JSON.stringify(value));
                console.log("data = " + JSON.stringify(data));
                if(value.term === data.term && 
                    value.caseSensitive === data.caseSensitive &&
                    value.descriptionType.name === data.descriptionType.name) {                    
                    result = true;
                }                
            });
            return result;
        }
        
        self.updateItem = (key, data) => {                                       
                 
            console.log(key);    
            
            var result = self.itemExists(data);
            
            if (!result) {
                self.dataDescriptions()[key] = data;
            }        
            else {
                alert("ya existe una descripción con estas características");
            }
            
            console.log(JSON.stringify(self.dataDescriptions()));
                                
        };
        
        self.submitRow = (key) => {                                       
                 
            console.log(key);

            self.updateItem(key, self.rowData);             
                                                                           
        };
        
        self.isRowDataUpdated = () => {
            const propNames = Object.getOwnPropertyNames(self.rowData);
            for (let i = 0; i < propNames.length; i++) {
                if (self.rowData[propNames[i]] !== self.originalData[propNames[i]]) {
                    return true;
                }
            }
            return false;
        };
        
        // checking for validity of editables inside a row
        // return false if one of them is considered as invalid
        self.hasValidationErrorInRow = (table) => {
            const editables = table.querySelectorAll(".editable");
            for (let i = 0; i < editables.length; i++) {
                const editable = editables.item(i);
                /*
                editable.validate();
                // Table does not currently support editables with async validators
                // so treating editable with 'pending' state as invalid
                if (editable.valid !== "valid") {
                    return true;
                }
                */
            }
            return false;
        };
        
        self.handleUpdate = (event, context) => {
            console.log(context.row);
            self.editRow({ rowKey: context.row.id });
        };
        
        self.handleDone = () => {
            self.editRow({ rowKey: null });
        };
        
        self.handleCancel = () => {                                                                 
            
            var txt;
            var r = confirm("¿Está seguro que desea eliminar el registro?");
            
            if (r == true) {
                self.deleteRow(self.rowData.id);
            } else {              
                self.cancelEdit = true;
                self.editRow({ rowKey: null });    
            }                        
        };
        
        self.handleValueChanged = () => {
            self.filter(document.getElementById("filter").rawValue);
        };
        
        self.getDescriptionTypeById = (id) => {                      
            
            var toReturn; 
                 
            $(self.dataDescriptionTypes()).each(function(key,value) {                                 
                
                if(value.id === id) {                    
                    toReturn = value;
                    return false;
                }                
            });
            
            return toReturn;
                                                                           
        };
        
        self.deleteRow = (key) => {                                       
                 
            console.log(key);

            $.ajax({                    
              type: "DELETE",
              url: ko.dataFor(document.getElementById('globalBody')).serviceContext + "/accounts/delete/" + key,                                        
              dataType: "json",                    
              //crossDomain: true,
              contentType : "application/json",                    
              success: function() {                    
                    alert("Registro borrado correctamente");
                    var val = $("#filter").val();
                    $("#filter").val(" ");
                    $("#filter").val(val);
              },
              error: function (request, status, error) {
                    alert(request.responseText);                          
              },                                  
            });                                                                           
        };
        
        self.getRndInteger = (min, max) => {
            return Math.floor(Math.random() * (max - min) ) + min;
        }
                            
    }
       
    return descriptionsContentViewModel;
});
