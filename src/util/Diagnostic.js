Ext.define('Extensible.util.Diagnostic', {
    singleton: true,
    
    options: {
        core: {
            ajaxRequests: true,
            ajaxResponses: true,
            writerOutput: true,
            readerOutput: true
        },
        calendar: {
            eventLayoutDataMatrix: true,
            eventLayoutVisualOutlines: true,
            editorRecordOnLoad: true,
            editorRecordOnUpdate: true
        }
    },  
    
    log: function(o) {
        if (window.console) {
            o = o || {};
            if (Ext.isString(o)) {
                o.msg = o;
            };
            if (o.msg) {
                console.log(o.msg);
            }
            if (o.dump) {
                console.dir(o.dump);
            }
        }
    },
    
    init: function() {
        this.instrumentCore();
        this.instrumentCalendar();
    },
    
    instrumentCore: function() {
        var me = this;
        
        if (!me.options.core) {
            return;
        }
        
        if (Ext.data) {
            if (Ext.data.Connection) {
                if (me.options.core.ajaxRequests) {
                    Ext.data.Connection.override({
                        request: function() {
                            var result = this.callParent(arguments);
                            me.log({
                                msg: 'Ajax request (' + result.options.method + '):',
                                dump: result
                            });
                            return result;
                        }
                    });
                }
                if (me.options.core.ajaxResponses) {
                    Ext.data.Connection.override({
                        onComplete: function() {
                            var result = this.callParent(arguments);
                            me.log({
                                msg: 'Ajax response:',
                                dump: result
                            });
                            return result;
                        }
                    });
                }
            }
        
            if (Ext.data.writer && Ext.data.writer.Writer) {
                if (me.options.core.writerOutput) {
                    Ext.data.writer.Writer.override({
                        write: function() {
                            var result = this.callParent(arguments);
                            me.log({
                                msg: 'Writer output:',
                                dump: result
                            });
                            return result;
                        }
                    })
                }
            }
            
            if (Ext.data.reader && Ext.data.reader.Reader) {
                if (me.options.core.readerOutput) {
                    Ext.data.reader.Reader.override({
                        read: function() {
                            var result = this.callParent(arguments);
                            me.log({
                                msg: 'Reader output (' + result.records.length + '):',
                                dump: result
                            });
                            return result;
                        }
                    })
                }
            }
        }
    },
    
    instrumentCalendar: function() {
        var me = this;
        
        if (!me.options.calendar) {
            return;
        }
        
        if (me.options.calendar.eventLayoutVisualOutlines) {
            Ext.getBody().addCls('ext-cal-diag');
        }
        
        if (Extensible.calendar) {
            if (me.options.calendar.eventLayoutDataMatrix) {
                Extensible.calendar.view.AbstractCalendar.override({
                    prepareData: function() {
                        this.callParent(arguments);
                        me.log({
                            msg: 'Calendar event layout grid:',
                            dump: this.eventGrid
                        });
                    }
                })
            }
            
            if (Extensible.calendar.form.EventWindow) {
                if (me.options.calendar.editorRecordOnLoad) {
                    Extensible.calendar.form.EventWindow.override({
                        show: function() {
                            var result = this.callParent(arguments);
                            me.log({
                                msg: 'Event window loaded record:',
                                dump: this.activeRecord
                            });
                            return result;
                        }
                    });
                }
                if (me.options.calendar.editorRecordOnUpdate) {
                    Extensible.calendar.form.EventWindow.override({
                        updateRecord: function() {
                            var result = this.callParent(arguments);
                            me.log({
                                msg: 'Event window updated record:',
                                dump: this.activeRecord
                            });
                            me.log({
                                msg: 'Event window modified data:',
                                dump: this.activeRecord.modified
                            });
                            return result;
                        }
                    });
                }
            }
            
            if (Extensible.calendar.form.EventDetails) {
                if (me.options.calendar.editorRecordOnLoad) {
                    Extensible.calendar.form.EventDetails.override({
                        loadRecord: function() {
                            var result = this.callParent(arguments);
                            me.log({
                                msg: 'Event details loaded record:',
                                dump: this.activeRecord
                            });
                            return result;
                        }
                    });
                }
                if (me.options.calendar.editorRecordOnUpdate) {
                    Extensible.calendar.form.EventDetails.override({
                        updateRecord: function() {
                            var result = this.callParent(arguments);
                            me.log({
                                msg: 'Event details updated record:',
                                dump: this.activeRecord
                            });
                            me.log({
                                msg: 'Event details modified data:',
                                dump: this.activeRecord.modified
                            });
                            return result;
                        }
                    });
                }
            }
        }
    }
});

Ext.onReady(Extensible.util.Diagnostic.init, Extensible.util.Diagnostic);
