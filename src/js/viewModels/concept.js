/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * backtest module
 */
define(['ojs/ojcore','knockout',
        'ojs/ojresponsiveutils', 
        'ojs/ojresponsiveknockoututils',
        'ojs/ojarraydataprovider',
        "ojs/ojradioset",
        "ojs/ojswitcher",
        'ojs/ojcollapsible',
        'ojs/ojconverter-number','ojs/ojchart','ojs/ojformlayout'], 
function (oj, ko, responsiveUtils, responsiveKnockoutUtils, ArrayDataProvider, NumberConverter) {
    /**
     * The view model for the main content view template
     */        
    function conceptContentViewModel(params) {
        
        var self = this;        
        
        self.name = ko.observable();
        
        /* Variables */
        self.id = ko.observable(1);
        
        self.fsnSensibility = ko.observable("false");
        self.fsnTerm = ko.observable("");   
        
        self.favoriteSensibility = ko.observable("false");
        self.favoriteTerm = ko.observable("");
        
        self.selectedItem = ko.observable("descriptions-tab");             
              
        self.dataProvider = ko.observableArray();
        
        self.conceptModel = ko.observable();
        
        self.tabs = ko.observableArray();               
        
        self.relationshipDefinitionsModel = ko.observableArray();        
        
        self.conceptModel1 = ko.computed(function () {
            
            //console.log(JSON.stringify(params));            
            if (typeof params.categoryModel() === 'undefined') {
                return;
            }                                                                                                           
            
            var categoryId = params.categoryModel().get('id');               

            $.getJSON("http://dnssemantikos:8080/ws/rest/concepts/new/" + categoryId).
                then(function (concept) {                    
                    console.log(JSON.stringify(concept.validDescriptionsButFSNandFavorite));
                    self.conceptModel(concept);
                    
                    console.log("self.conceptModel() = " + JSON.stringify(self.conceptModel()));
                    
                    self.fsnSensibility(concept.validDescriptionFSN.caseSensitive.toString());
                    self.fsnTerm(concept.validDescriptionFSN.term);   

                    self.favoriteSensibility(concept.validDescriptionFavorite.caseSensitive.toString());
                    self.favoriteTerm(concept.validDescriptionFavorite.term);  
                });   
                
            $.getJSON("http://dnssemantikos:8080/ws/rest/relationshipDefinitions/smtk/" + categoryId).
                then(function (relationshipDefinitions) {                                        
                    self.relationshipDefinitionsModel(relationshipDefinitions);                     
                    
                    console.log(self.relationshipDefinitionsModel());                                        
                    
                    if(relationshipDefinitions.length !== 0) {
                        self.tabs([
                            { name: "Otras Descripciones", id: "descriptions-tab" },
                            { name: "Atributos", id: "attributes-tab"}
                        ]);                                                    
                    }
                    else {                                
                        self.tabs([{ name: "Otras Descripciones", id: "descriptions-tab" }]);                         
                    }
                    
            });                          
                
            return params;
        });
        
         self.dataProvider = new ArrayDataProvider(self.tabs, { keyAttributes: "id" });
                                            
    }
    
    self.submitConcept = function (event, data) {
            
        let element1 = document.getElementById("term-favourite");

        let valid = false;
        // validate them both, and when they are both done
        // validating and valid, submit the form.
        // Calling validate() will update the component's
        // valid property
        element1.validate().then((result1) => {

            if (result1 === "valid") {
                // submit the form would go here
                //alert("everything is valid; submit the form");                

                //self.conceptModel().validDescriptionFavorite.term = self.favoriteTerm();
                //self.conceptModel().validDescriptionFavorite.caseSensitive = self.favoriteSensibility();                

                console.log(JSON.stringify(self.conceptModel));

                //alert(JSON.stringify(account));

                $.ajax({                    
                    type: "POST",
                    url: ko.dataFor(document.getElementById('globalBody')).serviceContext + "/concepts/submit",                                        
                    dataType: "json",      
                    data: JSON.stringify(account),			  		 
                    //crossDomain: true,
                    contentType : "application/json",                    
                    success: function() {                    
                        alert("Registro grabado correctamente");
                        $("input").val("");                                          
                    },
                    error: function (request, status, error) {
                        alert(request.responseText);                          
                    }                                  
                });            
            }
        });

    }
       
    return conceptContentViewModel;
});
