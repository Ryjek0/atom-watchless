Watchless = require './watchless.js'

module.exports =
    config:
      lessPaths:
        title:"Less paths"
        description: "Paths to less files. (** for all directory)"
        type: 'array'
        default: ["less/main","less/modules","less/events"]
        order: 2
        items:
          type:"string"
      compiledPaths:
        title:"Style paths"
        description: "Output paths"
        type: 'array'
        default: ["styles/main","styles/modules","styles/events"]
        order: 3
        items:
          type:"string"
      showNotifOnSuccess:
        title:"Show notifications on success"
        type:"boolean"
        default: true
        order: 4
      generateSourceMap:
        title:"Generate source maps"
        type:"boolean"
        default: true
        order: 6
      minimaliseCss:
        title:"Minimalise css"
        type:"boolean"
        default: true
        order: 5
      startWachOnStartup:
        title:"Start waching files on startup"
        type:"boolean"
        default:false
        order: 1
      
    activate: (state) -> 
      @watchless = new Watchless(state);
      # atom.commands.add 'atom-workspace', 'watchless:startGulpWatch', ->  this.startGulp()
      # atom.commands.add 'atom-workspace', 'watchless:generateAllLess', -> this.generateAllLess()
      # 
      # @watchless.startGulp();
    
    deactivate: -> 
      @modalPanel.destroy();
      @subscriptions.dispose();
      @watchlessView.destroy();
    
    serialize: -> 
      # return {
      #   watchlessViewState: @watchlessView.serialize()
      # };

    startGulpWatch: ->
      
