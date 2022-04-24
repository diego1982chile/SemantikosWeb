/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * backtest module
 */
define(['ojs/ojcore','knockout', 
        'ojs/ojarraydataprovider',     
        "ojs/ojlistdataproviderview",  
        "ojs/ojdataprovider",
        "ojs/ojselectsingle",
        "ojs/ojradioset",
        'ojs/ojarraytabledatasource',                
        'ojs/ojtable',
        'ojs/ojformlayout'], 
function (oj, ko, ArrayDataProvider, ListDataProviderView, ojdataprovider_1) {
    /**
     * The view model for the main content view template
     */        
    function descriptionsContentViewModel(params) {
        
        var self = this;        
             
        self.name = ko.observable();
        
        /* Variables */
        self.id = ko.observable(1);
        
        self.sensibility = ko.observable(false);
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
            
            //console.log(params.conceptModel().validDescriptionsButFSNandFavorite);
            
            self.dataDescriptions(params);
                      
            let filterCriterion = null;                        

            if (self.filter() && self.filter() != "") {
                filterCriterion = ojdataprovider_1.FilterFactory.getFilter({
                    filterDef: { text: self.filter() },                    
                    //filterOptions: {textFilterAttributes: ["client"]}
                });                
            }                        
                       
            const arrayDataProvider = new ArrayDataProvider(
                params.conceptModel().validDescriptionsButFSNandFavorite,
                {idAttribute: 'id'}
            ); 
    
            //console.log(self.data());

            return new ListDataProviderView(arrayDataProvider, 
                                            {filterCriterion: filterCriterion},
                                            );
            
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
              
              //console.log("rowContext.status = " + JSON.stringify(rowContext.status));
              //console.log("self.data() = " + JSON.stringify(self.data()));
              
              self.getById(rowContext.status.rowKey)
              
              self.originalData = Object.assign({}, self.getById(rowContext.status.rowKey));
              self.rowData = Object.assign({}, self.getById(rowContext.status.rowKey));
              
              //self.originalData = Object.assign({}, rowContext.item.data);
              //self.rowData = Object.assign({}, rowContext.item.data);
              
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
        
        self.submitRow = (key) => {                                       
                 
            console.log(key);

            $.ajax({                    
              type: "PUT",
              url: ko.dataFor(document.getElementById('globalBody')).serviceContext + "/accounts/update",                                        
              dataType: "json",      
              data: JSON.stringify(self.rowData),			  		 
              //crossDomain: true,
              contentType : "application/json",                    
              success: function() {                    
                    alert("Registro grabado correctamente");
                    var val = $("#filter").val();
                    $("#filter").val(" ");
                    $("#filter").val(val);
              },
              error: function (request, status, error) {
                    alert(request.responseText);                          
              },                                  
            });
                                                                           
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
            //console.log(context);
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
        
        self.getById = (id) => {                      
            
            var toReturn; 
                 
            $(self.data()).each(function(key,value) {                                 
                
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
                            
    }
       
    return descriptionsContentViewModel;
});
