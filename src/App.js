Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
	if (this.down('#features')) {
	    this.down('#features').destroy();
	}
	var features = Ext.create('Rally.ui.combobox.ComboBox',{
	    id: 'features',
	    storeConfig: {
		model: 'PortfolioItem/Feature',
		fetch: ['FormattedID','Name','Release', 'UserStories'],
		pageSize: 100,
		autoLoad: true,
	    },
	    fieldLabel: 'select Feature',
	    listeners:{
                ready: function(combobox){
		    if (combobox.getRecord()) {
			this._onFeatureSelected(combobox.getRecord());
		    }
		},
                select: function(combobox){
		    if (combobox.getRecord()) {
			this._onFeatureSelected(combobox.getRecord());
		    }
			        
                },
                scope: this
            }
	});
	this.add(features);
    },
    
    _onFeatureSelected: function(feature){
        var that = this;
        console.log(feature);
        if (this.down('#b')) {
	    this.down('#b').destroy();
	}
        var cb = Ext.create('Ext.Container', { 
            items: [
                {
                    xtype  : 'rallybutton',
                    text      : 'create',
                    itemId: 'b',
                    handler: function() {
                            that._getModel(feature); 
                    }
                }
                        
            ]
        });
        this.add(cb);
    },
    
     _getModel: function(feature){
        var that = this;
            Rally.data.ModelFactory.getModel({
                type: 'UserStory',
                context: {
                    workspace: '/workspace/12352608129'         
                },
                success: function(model) {  
                    that._model = model;
                    var story = Ext.create(model, {
                        Name: 'story 777',
                        Description: 'created via appsdk2'
                    });
                    story.save({
                        callback: function(result, operation) {
                            if(operation.wasSuccessful()) {
                                console.log("_ref",result.get('_ref'), ' ', result.get('Name'));
                                that._record = result;
                                that._readAndUpdateStory(feature);
                            }
                            else{
                                console.log("?");
                            }
                        }
                    });
                }
            });
    },
        
    _readAndUpdateStory:function(feature){
        var that = this;
            var id = this._record.get('ObjectID');
            console.log('OID', id);
            console.log('feature', feature);
            this._model.load(id,{
                fetch: ['Name', 'FormattedID', 'ScheduleState', 'PortfolioItem', 'MyKB'],
                callback: function(record, operation){
                    console.log('ScheduleState prior to update:', record.get('ScheduleState'));
                    record.set('ScheduleState','In-Progress');
                    record.set('PortfolioItem', feature.get("_ref"));
                    record.set('Project', '/project/12352608219');
                    record.set('MyKB', 'id');
                    record.save({
                        callback: function(record, operation) {
                            if(operation.wasSuccessful()) {
                                console.log('ScheduleState after update..', record.get('ScheduleState'));
                                console.log('Custom field MyKB after update..', record.get('MyKB'));
                                console.log('The Feature parent of this story after update..', record.get('PortfolioItem'));
                                that._readAndUpdateFeature(feature);
                            }
                            else{
                                console.log("?");
                            }
                        }
                    });
                }
            })
    },
    _readAndUpdateFeature:function(feature){
        var id = feature.get('ObjectID');
        console.log('id',id);
        Rally.data.ModelFactory.getModel({
            type: 'PortfolioItem/Feature',
            success: function(model) {
                model.load(id,{
                    fetch: ['Name', 'FormattedID', 'CustomDropDown'],
                    callback: function(record, operation){
                        console.log('CustomDropDown prior to update...', record.get('CustomDropDown'));
                         record.set('CustomDropDown', 'one');
                          record.save({
                            callback: function(record, operation) {
                                if(operation.wasSuccessful()) {
                                console.log('CustomDropDown after update..', record.get('CustomDropDown'));
                                }
                            }
                         })
                    }
                })
                
            }
        });
        
    }
        
});
