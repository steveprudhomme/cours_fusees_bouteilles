window.controller = {
	fStrings : ["","",
		"",""],

	/* === Public ============================================================= */
	init : function() {
		try{
			console.log("controller.init");
			this.fSlideshow = window.opener;
			if (!this.fSlideshow) throw "Cannot find Slideshow";
			window.addEventListener("message", (event) => {
				controller.receiveCommand(JSON.parse(event.data));
			}, false,);
			this.sendCommand({cmd:"init"});
		} catch(e){
			scCoLib.log("ERROR - slideshow.init : "+e);
		}
	},

	/** controller.sendCommand */
	sendCommand : function(pCmdObj){
		if (!pCmdObj.cmd) throw "controller.sendCommand : Illegal command object";
		console.log("controller.sendCommand : " + pCmdObj.cmd);
		this.fSlideshow.postMessage(JSON.stringify(pCmdObj), "*");
	},

	/** controller.receiveCommand */
	receiveCommand : function (pCmdObj){
		if (!pCmdObj.cmd) throw "controller.receiveCommand : Illegal command object";
		switch (pCmdObj.cmd) {
			case "init" : {
				break;
			}
			case "update" : {
				console.log(pCmdObj.sldId);
				break;
			}
			case "log" : {
				console.log(pCmdObj.msg);
				break;
			}
			default : {
				console.log("Unknown command : " + pCmdObj.cmd);
			}
		}

	},
	ping : function(){
		console.log("controller.ping");
		this.sendCommand({cmd:"log", msg:"PING"}, "*");
	},

}
