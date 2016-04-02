
// Mapgets demo helper and utils for common actions

(function(root) {
    if (!root || root.JamBusterHelper)
        return;

    root.JamBusterHelper =
    {
        _cache   : {},
        _options : {},

        init : function(options)
        {
            this._options = $.extend(true, {
                rts :
                {
                    enabled     : true,
                    distance    : 10000,
                    minDistance : 200,
                    rot         : { x : -40, y : 0, z : 0 }
                },
                coordinate : undefined
            }, options);

            // RTS
            if (!this._cache.rts && this._options.rts && this._options.rts.enabled)
            {
                var activeCamera = Tundra.renderer.activeCameraEntity();
                if (activeCamera && activeCamera.camera)
                    this.onActiveCameraChanged(activeCamera.camera);
                Tundra.renderer.onActiveCameraChanged(this, this.onActiveCameraChanged)

                this._cache.rts = {};
                this._cache.rts.ent = Tundra.client.runApplication("RTS", "meshmoon-applications://meshmoon/rts-camera/rts-camera.webrocketjs");
                this._cache.rts.ent.script.onScriptStarted(function(entity, component, scriptAsset, app) {
                    this._cache.rts.app = app;
                }.bind(this));
            }

            // Start coordinate
            if (this._options.coordinate && !Tundra.plugins.meshmoonGeo.running)
            {
                Tundra.plugins.meshmoonGeo.env.setupDefaultSkyBox();
                Tundra.plugins.meshmoonGeo.start(this._options.coordinate);
            }
        },

        onActiveCameraChanged : function(activeCameraComponent, prevCameraComponent)
        {
            var cameraName = (activeCameraComponent.parentEntity ? activeCameraComponent.parentEntity.name : "");
            if (typeof cameraName !== "string" || cameraName === "")
                return;

            this.camera = activeCameraComponent.parentEntity;
            console.debug("Active camera changed", this.camera.name);

            // If RTS camera execute configuration
            if (this.camera.name === "MeshmoonRtsCamera" && !this._cache.rts.configured)
            {
                this._cache.rts.configured = true;

                setTimeout(function() {
                    if (this._options.rts.rot)
                        this.camera.exec(EntityAction.Local, "SetRotation", this._options.rts.rot);
                    if (typeof this._options.rts.distance === "number")
                        this.camera.exec(EntityAction.Local, "SetDistance", this._options.rts.distance);
                    if (typeof this._options.rts.minDistance === "number")
                        this.camera.exec(EntityAction.Local, "SetMinDistance", this._options.rts.minDistance);

                    // Emulate Mapgets camera behavior
                    this.camera.exec(EntityAction.Local, "SetTiltRange", { min : 30 });
                    this.camera.exec(EntityAction.Local, "SetStreetViewDistances", { distance : 400, tilt : 20 });
                    this.camera.exec(EntityAction.Local, "SetMaxDistance", this.camera.camera._farPlane() - (this.camera.camera._farPlane() * 0.05));
                    
                    
                    if (typeof this._options.onCameraReady === "function")
                        this._options.onCameraReady(this.camera);
                }.bind(this), 100);
            }
        }
    };
})(window);
