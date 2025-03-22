window.slideshow = {
	fBtnPath : "ide:root/chi:nav.tools",
	fHomePath : "ide:home",
	fTocPath : "ide:tocFrame",
	fTocScrollPath : "ide:tocScroll",
	fIsHome : true,
	fReady : false,
	fObjectives : false,
	fMap : false,
	fTools : false,
	fToc : null,
	fTocSrl : null,
	fTglBtn : null,
	fSldCnt : [],
	fAltBlkCnt : [],
	fTocEntries : {},
	fSldList : [],
	fSldCount : 0,
	fBlkCount : 0,
	fThemingBtnActive: false,
	fThemingBtnPath: "ide:root",
	fCounterTemplate : '<span class="sld">øcurrentSlideø</span><span class="blk">.øcurrentBlockInSlideø</span>', // Available : øcurrentSlideø, øtotalSlidesø, øcurrentBlockø, øcurrentBlockInSlideø, øtotalBlocksø, øblock%ø, øslide%ø
	fDysOptions : {
		pathRoot: "ide:root",
		pathContent: "ide:slideFrame",
		pathBtnParent : "ide:root/chi:nav.tools",
		pathPanelParent : "ide:root",
		type : "dys",
		disable: false,
		defaultPanelInactive: true,
		optNumHeadings: true,
		optScaleH2: true,
		ignoreFilter: ".dysPanel|.hidden|.footnotes|.CodeMirror-static|script|noscript|object|.tooltip_ref|.bkSolResOut|.toolbar|.txt_mathtex_tl|.MathJax_Preview|.MathJax_SVG_Display|i.type"
	},

	fStrings : ["menu","",
	/*02*/	"Cacher le menu (touche M)","Afficher le menu (touche M)",
	/*04*/	"défilement haut","Faire défiler le menu vers le haut",
	/*06*/	"défilement bas","Faire défiler le menu vers le bas",
	/*08*/  "", "thème",
	/*10*/  "Passer au thème sombre", "Passer au thème clair",
	""],

	/* === Public ============================================================= */
	init : function(pParam) {
		if (!pParam) pParam = {};
		try{
			let i;
			if (scHPS.fDisabled) return;
			this.fHome = scPaLib.findNode(this.fHomePath);
			this.fToc = scPaLib.findNode(this.fTocPath);
			this.fTocSrl = scPaLib.findNode(this.fTocScrollPath);
			this.fProgressBar = scPaLib.findNode("des:.progressbar");
			this.fProgressBar.className = this.fProgressBar.className + " prog_0";
			scDynUiMgr.addElement("div", this.fProgressBar, "progCount");
			// init toc position
			if(scHPS.fStore.get("tocClose") === "false") this.openToc();
			else this.closeToc();
			// Init all sub tocs
			const vSubs = scPaLib.findNodes("des:ul.tocListOpen", sc$("toc"));
			vSubs.forEach(item => {
				item.fTglBtn = scPaLib.findNode("psi:button",item);
			});
			const vFirstSubs = scPaLib.findNodes("chi:li/chi:ul.tocListOpen", sc$("toc"));
			for (i = 0; i < vFirstSubs.length; i++) this.toggleMenuItem(vFirstSubs[i].fTglBtn, true);
			const vTocEntries = scPaLib.findNodes("des:a", this.fTocSrl);
			for (i = 0; i < vTocEntries.length; i++){
				const vTocEntry = vTocEntries[i];
				vTocEntry.fIdx = i;
				this.fTocEntries[vTocEntry.hash.substring(1)] = vTocEntry;
			}
			scPresMgr.toggleKeyboardNavigation(false);
			// Register scPresMgr listeners
			scPresMgr.register("onSldShow",this.onHpsSldShow);
			scPresMgr.register("onSldRestart",this.onHpsSldShow);
			scPresMgr.register("onBlkShow",this.onHpsBlkShow);
			scPresMgr.register("onAction",this.onHpsAction);
			scPresMgr.register("onKeyPress",this.onHpsKeyPress);
			// Add SiRule to keep current selected element visible
			this.fKeepVis = new this.EnsureVisibleTask("des:a.selected",this.fTocSrl);
			scSiLib.addRule(this.fHome, this);
			this.resizeHome();

			// Accessibility Toolbar
			if(pParam.accessBar !== "none"){
				this.setDysOptions(pParam.accessBar);
				const vScript = document.createElement('script');
				vScript.setAttribute("src", scServices.scLoad.resolveDestUri("/lib-md/w_slideshow/dys/dys.js"))
				document.getElementsByTagName("head")[0].appendChild(vScript);
				const vCss = document.createElement("link");
				vCss.setAttribute("rel", "stylesheet")
				vCss.setAttribute("type", "text/css")
				vCss.setAttribute("href", scServices.scLoad.resolveDestUri("/lib-md/w_slideshow/dys/dys.css"));
				document.getElementsByTagName("head")[0].appendChild(vCss);
			}

			// Theme button
			if(this.fThemingBtnActive || pParam.themeMode==="button"){
				let vBd = dom.newBd(scPaLib.findNode(this.fThemingBtnPath));
				this.fThemingBtn = vBd.elt("a", "themeBtn")
					.att("href", "#")
					.att("role", "button")
					.prop("fTheme", localStorage.getItem("theme-preference") ? localStorage.getItem("theme-preference") : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
					.prop("setPreference", function (){
						localStorage.setItem("theme-preference", this.fTheme);
						this.reflectPreference();
					})
					.prop("reflectPreference", function (){
						document.documentElement.setAttribute("data-theme", this.fTheme);
						this.setAttribute("title", this.fTheme === "dark" ? slideshow.fStrings[11] : slideshow.fStrings[10]);
					})
					.listen("click", function(){
						this.fTheme = this.fTheme === "light" ? "dark" : "light";
						this.setPreference();
					})
					.call("reflectPreference")
					.elt("span").text(this.fStrings[9]).up().currentUp();

				window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({matches:isDark}) => {
					slideshow.fThemingBtn.fTheme = isDark ? "dark" : "light";
					slideshow.fThemingBtn.setPreference();
				});
			} else if (pParam.themeMode !== "none"){
				document.documentElement.setAttribute("data-theme", pParam.themeMode);
			}

			// Listeners
			window.addEventListener("keyup", function(pEvt){slideshow.sOnKeyUp(pEvt)},false);
			window.addEventListener("message", (event) => {
				slideshow.receiveCommand(JSON.parse(event.data));
			}, false,);

			scCoLib.addEventsHandler(this);
		} catch(e){
			console.error("ERROR - slideshow.init : "+e);
		}
	},

	/** slideshow.setDysOptions */
	setDysOptions: function (pType) {
		window.dysOptions = {
			type : pType || this.fDysOptions.type,
			pathRoot : this.fDysOptions.pathRoot,
			pathContent : this.fDysOptions.pathContent,
			pathBtnParent : this.fDysOptions.pathBtnParent,
			pathPanelParent : this.fDysOptions.pathPanelParent,
			disable : this.fDysOptions.disable,
			defaultPanelInactive : this.fDysOptions.defaultPanelInactive,
			optNumHeadings: this.fDysOptions.optNumHeadings,
			optScaleH2: this.fDysOptions.optScaleH2 ? !!scPaLib.findNode("ide:toc/chi:li/chi:ul") : false,
			ignoreFilter : this.fDysOptions.ignoreFilter
		}
	},

	/** slideshow.sendCommand */
	sendCommand : function(pCmdObj){
		if (!this.fController) return;
		if (!pCmdObj.cmd) throw "slideshow.sendCommand : Illegal command object";
		console.log("slideshow.sendCommand : " + pCmdObj.cmd);
		this.fController.postMessage(JSON.stringify(pCmdObj), "*");
	},

	/** slideshow.receiveCommand */
	receiveCommand : function (pCmdObj){
		if (!pCmdObj.cmd) throw "slideshow.receiveCommand : Illegal command object";
		switch (pCmdObj.cmd) {
			case "init" : {
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

	/** slideshow.onLoad */
	onLoad : function() {
		try{
			let i;
			this.fSldList = scPaLib.findNodes("des:.mainSlide", sc$("slideFrame"));
			for (i = 0; i < this.fSldList.length; i++) this.fBlkCount += this.fSldList[i].fSldHdr.fBlkCount;
			this.fSldCount = this.fSldList.length;

			// Add menu toggle button
			this.fTglBtn = this.xAddBtn(scPaLib.findNode(this.fBtnPath), "btnMenu", this.xGetStr(0), (this.fOpen ? this.xGetStr(2) : this.xGetStr(3)), scPaLib.findNode(this.fBtnPath+"/chi:div"));
			this.fTglBtn.onclick = this.toggleToc;

			// Add menu scroller
			new this.ScrollTask(this.fTocSrl);

			// Init slideshow navbar slideCount
			const vNavbars = scPaLib.findNodes("des:nav.tools/chi:.navbar", sc$("root"));
			for (i = 0; i < vNavbars.length; i++){
				const vNavbar = vNavbars[i];
				this.fSldCnt.push(scDynUiMgr.addElement("span", vNavbar, "slideCount", scPaLib.findNode("chl:button", vNavbar)))
			}
			this.updateSlideCounters();

			// Init altSlide navbar blockCount
			const vAltNavbars = scPaLib.findNodes("des:nav.tools/chi:.navbar", sc$("altSlides"));
			for (i = 0; i < vAltNavbars.length; i++){
				const vAltNavbar = vAltNavbars[i];
				this.fAltBlkCnt.push(scDynUiMgr.addElement("span", vAltNavbar, "blockCount", scPaLib.findNode("chl:button", vAltNavbar)))
			}

			document.body.classList.remove("loading");
			this.fReady = true;
		} catch(e){
			console.log("ERROR - slideshow.onLoad : "+e);
		}
	},
	loadSortKey : "B",

	start : function(){
		if (!this.fReady) return;
		this.fIsHome = false;
		document.body.classList.add("showSlideshow");
		document.body.classList.remove("showHome");
		window.setTimeout(function(){scPresMgr.toggleKeyboardNavigation(true)}, 10);
	},

	home : function(){
		this.fIsHome = true;
		document.body.classList.add("showHome");
		document.body.classList.remove("showSlideshow");
		scPresMgr.toggleKeyboardNavigation(false);
		scPresMgr.loadSlide(scPresMgr.fFirstLocalIdx, true, true);
	},

	toggleFullScreen : function(){
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen();
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	},

	/** Called by the toggle button - this == slideshow.fModeHtmlBtn. */
	toggleToc : function(){
		if (scPresMgr.xResetFocus) scPresMgr.xResetFocus();
		if (slideshow.fOpen){
			slideshow.closeToc();
		} else {
			slideshow.openToc();
		}
		return false;
	},

	closeToc : function(){
		scHPS.fStore.set("tocClose","true");
		document.body.classList.add("tocClose");
		this.fOpen = false;
		if (this.fTglBtn) this.fTglBtn.title = this.xGetStr(3);
		scSiLib.fireResizedNode(document.body);
	},

	openToc : function(){
		scHPS.fStore.set("tocClose","false");
		document.body.classList.remove("tocClose");
		this.fOpen = true;
		if (this.fTglBtn) this.fTglBtn.title = this.xGetStr(2);
		if (this.fKeepVis) this.fKeepVis.resetNode();
		scSiLib.fireResizedNode(document.body);
	},

	toggleMenuItem : function(pBtn, pAuto){
		if (!pBtn) return;
		const vStatus = pBtn.className;
		const vUl = scPaLib.findNode("nsi:ul", pBtn);
		if (!vUl) return;
		vUl.fIsAuto = pAuto;
		if(vStatus === "btnToggleClosed") {
			pBtn.className = "btnToggleOpen";
			pBtn.innerHTML = '<span>V</span>';
			vUl.className = vUl.className.replace("tocListClosed", "tocListOpen");
			vUl.style.display = "";
		} else {
			pBtn.className = "btnToggleClosed";
			pBtn.innerHTML = '<span>></span>';
			vUl.className = vUl.className.replace("tocListOpen", "tocListClosed");
			vUl.style.display = "none";
			const vOpendSubMnus = scPaLib.findNodes("des:ul.tocListOpen", vUl);
			for (let i=0; i < vOpendSubMnus.length; i++) this.toggleMenuItem(vOpendSubMnus[i].fTglBtn, true);
		}
	},

	updateProgress : function(){
		if(!this.fBlkCount) return;
		let vBlkCount = 0, vBlkCurrent = 0;
		for (let i = 0; i < this.fSldList.length; i++){
			const vSlide = this.fSldList[i];
			if (vSlide === this.fCurrentSld){
				vBlkCurrent = vBlkCount + Number(vSlide.fSldHdr.getCurrBlkCounter())+1;
				break;
			}
			vBlkCount += vSlide.fSldHdr.fBlkCount;
		}
		this.fProgress = vBlkCurrent / this.fBlkCount;
		this.fProgressBar.className = this.fProgressBar.className.replace(/prog_[0-9]*/gi,"prog_" + Math.floor(this.fProgress * 20)*5);
		this.fProgressBar.title = Math.floor(this.fProgress * 100) + "%";
	},

	updateSlideCounters : function(){
		let vBlkCount = 0, vBlkCurrent = 0, vSlideBlkCount = 0, vSlideIndex = 0;
		for (let i = 0; i < this.fSldList.length; i++){
			const vSlide = this.fSldList[i];
			if (vSlide === this.fCurrentSld){
				vSlideIndex = i+1;
				vSlideBlkCount = Number(vSlide.fSldHdr.getCurrBlkCounter())+1;
				vBlkCurrent = vBlkCount + vSlideBlkCount;
				break;
			}
			vBlkCount += vSlide.fSldHdr.fBlkCount;
		}
		this.fCounterHtml = this.fCounterTemplate
			.replace("øcurrentSlideø", vSlideIndex)
			.replace("øtotalSlidesø", this.fSldCount)
			.replace("øcurrentBlockø", vBlkCurrent)
			.replace("øcurrentBlockInSlideø", vSlideBlkCount)
			.replace("øtotalBlocksø", this.fBlkCount)
			.replace("øblock%ø",Math.floor(vBlkCurrent / this.fBlkCount * 100))
			.replace("øslide%ø",Math.floor(vSlideIndex / this.fSldCount * 100));
		for (let i = 0; i < this.fSldCnt.length; i++){
			const vSldCnt = this.fSldCnt[i];
			vSldCnt.innerHTML = this.fCounterHtml;
		}
	},

	updateAltSlideBlockCounters : function(){
		const vSldHdr = scPresMgr.fAltSlides.fSldHdr;
		for (let i = 0; i < this.fAltBlkCnt.length; i++){
			const vAltBlkCnt = this.fAltBlkCnt[i];
			if(vSldHdr.getCurrBlkCounter().length!=="") vAltBlkCnt.innerHTML =  (Number(vSldHdr.getCurrBlkCounter()) + 1) + "/" + vSldHdr.fBlkCount;
		}
	},

	/** slideshow.updateController */
	updateController : function (){
		if (!this.fController) return;
		this.sendCommand({
			cmd:"update",
			sldId: this.fCurrentSld ? this.fCurrentSld.id : null,
			cntr: this.fCounterHtml,
			prog : this.fProgress
		});
	},

	/** slideshow.onHpsKeyPress : listener : this == function */
	onHpsKeyPress : function(pCharCode) {
		switch(pCharCode){
			case 77://m
				slideshow.toggleToc();break;
		}
	},

	/** slideshow.onHpsBlkShow : listener : this == function */
	onHpsBlkShow : function(pBlk) {
		try{
			if(scPresMgr.fAltSlides.fAct) slideshow.updateAltSlideBlockCounters();
			else {
				slideshow.updateProgress();
				slideshow.updateSlideCounters();
			}
			slideshow.updateController();
		}catch(e){scCoLib.log("ERROR - slideshow.onBlkShow : "+e)}
	},

	/** slideshow.onHpsSldShow : listener : this == function */
	onHpsSldShow : function(pSld) {
		try{
			let i;
			slideshow.fCurrentSld = pSld;
			// Menu management
			if (slideshow.fCurrentEntry) slideshow.fCurrentEntry.classList.remove("selected");
			slideshow.fCurrentEntry = slideshow.fTocEntries[pSld.id];
			if (slideshow.fCurrentEntry) slideshow.fCurrentEntry.classList.add("selected");
			// Make sure this item is visible (open all ancestors)
			const vClosedSubTocs = scPaLib.findNodes("anc:ul.tocListClosed", slideshow.fCurrentEntry);
			for (i = 0; i < vClosedSubTocs.length; i++) slideshow.toggleMenuItem(vClosedSubTocs[i].fTglBtn, true);
			// Close all other auto-opened sub menus
			const iContainedInSub = function (pSub, pNode) {
				const vAncSubs = scPaLib.findNodes("anc:ul.tocList", pNode);
				for (let i = 0; i < vAncSubs.length; i++) if (vAncSubs[i] === pSub) return true;
				return false;
			};
			const iHasManuallyOpenedSub = function (pSub) {
				const vSubs = scPaLib.findNodes("des:ul.tocListOpen", pSub);
				for (let i = 0; i < vSubs.length; i++) if (!vSubs[i].fIsAuto) return true;
				return false;
			};
			const vOpenedSubs = scPaLib.findNodes("des:ul.tocListOpen", sc$("toc"));
			const vFilterIsOpened = scPaLib.compileFilter("ul.tocListOpen");
			for (i = 0; i < vOpenedSubs.length; i++) {
				const vSub = vOpenedSubs[i];
				// Sub must have been automatically opened, be still opened, not be part of the ancestors of the current link an not contain any manually subs...
				if (vSub.fIsAuto && scPaLib.checkNode(vFilterIsOpened,vSub) && !iContainedInSub(vSub,slideshow.fCurrentEntry) && !iHasManuallyOpenedSub(vSub)) slideshow.toggleMenuItem(vSub.fTglBtn, true);
			}
			// If this item has children, open the sub menu
			const vTocTgler = scPaLib.findNode("nsi:button.btnToggleClosed", slideshow.fCurrentEntry);
			if (vTocTgler) slideshow.toggleMenuItem(vTocTgler, true);
			if (slideshow.fKeepVis) slideshow.fKeepVis.resetNode();
			scSiLib.fireResizedNode(slideshow.fTocSrl);
			slideshow.updateProgress();
			slideshow.updateSlideCounters();
			slideshow.updateController();
		}catch(e){scCoLib.log("ERROR - slideshow.onSldShow : "+e)}
	},

	/** slideshow.onHpsAction : listener : this == function */
	onHpsAction : function(pAct) {
		try{
			if(pAct==="showAltSlide"){
				if(scPresMgr.fAltSlides.fAct) slideshow.updateAltSlideBlockCounters();
			}
		}catch(e){scCoLib.log("ERROR - slideshow.onAction : "+e)}
	},

	/** slideshow.resizeHome  */
	resizeHome : function() {
		const vBaseFontSize = Math.round(Math.sqrt(this.fHome.offsetHeight / 600 * this.fHome.offsetWidth / 800) * scHPS.fDefaultFontSize);
		this.fHome.style.fontSize = vBaseFontSize+"px";
	},

	onResizedAnc : function(pOwnerNode, pEvent){
		if(pEvent.phase===1) this.resizeHome();
	},
	onResizedDes : function(pOwnerNode, pEvent) {
	},
	/** slideshow.ruleSortKey : Api scSiLib. */
	ruleSortKey : "AAA",

	/* === Utilities ========================================================== */
	/** slideshow.xAddBtn : Add a HTML button to a parent node. */
	xAddBtn : function(pParent, pClassName, pCapt, pTitle, pNxtSib) {
		const vBtn = pParent.ownerDocument.createElement("button");
		vBtn.className = pClassName;
		vBtn.fName = pClassName;
		if (pTitle) vBtn.setAttribute("title", pTitle);
		vBtn.innerHTML = "<span>" + pCapt + "</span>"
		if (pNxtSib) pParent.insertBefore(vBtn,pNxtSib)
		else pParent.appendChild(vBtn);
		return vBtn;
	},
	/** Reteive a string. */
	xGetStr: function(pStrId) {
		return this.fStrings[pStrId];
	},
	/** Retrieve a sOnKeyUp. */
	sOnKeyUp: function(pEvt) {
		const vEvt = pEvt || window.event;
		const vCharCode = vEvt.which || vEvt.keyCode;
		switch(vCharCode) {
			case 70://f
				slideshow.toggleFullScreen();break;
			case 68://D
			case 72://H
				if (slideshow.fIsHome) return;
				slideshow.home();
				return;
			case 32://space
			case 39://→
			case 40://↓
			case 67://C
			case 78://N
			case 83://S
				if (!slideshow.fIsHome) return;
				slideshow.start();
				return;
		}
	}
}
slideshow.ScrollTask = function (pScrollNode) {
	this.fScrollNode = pScrollNode;
	this.fScrollNode.fMgr = this;
	this.fScrollNode.style.overflow="hidden";

	// Add Scroll up button
	this.fSrlUp = scDynUiMgr.addElement("div", pScrollNode.parentNode, "tocSrlUp", pScrollNode);
	this.fSrlUp.fMgr = this;
	this.fSrlUp.onclick = function(){
		this.fMgr.fSpeed -= 2;
	}
	this.fSrlUp.onmouseover = function(){
		if(this.fMgr.fSpeed >= 0) {
			this.fMgr.fSpeed = -2;
			scTiLib.addTaskNow(this.fMgr);
		}
	}
	this.fSrlUp.onmouseout = function(){
		this.fMgr.fSpeed = 0;
	}
	const vSrlUpBtn = slideshow.xAddBtn(this.fSrlUp, "tocSrlUpBtn", slideshow.xGetStr(4), slideshow.xGetStr(5));
	vSrlUpBtn.fMgr = this;
	vSrlUpBtn.onclick = function(){
		this.fMgr.step(-20);
		if (scPresMgr.xResetFocus) scPresMgr.xResetFocus();
		return false;
	}
	// Add Scroll down button
	this.fSrlDwn = scDynUiMgr.addElement("div", pScrollNode.parentNode, "tocSrlDwn");
	this.fSrlDwn.fMgr = this;
	this.fSrlDwn.onclick = function(){
		this.fMgr.fSpeed += 2;
	}
	this.fSrlDwn.onmouseover = function(){
		if(this.fMgr.fSpeed <= 0) {
			this.fMgr.fSpeed = 2;
			scTiLib.addTaskNow(this.fMgr);
		}
	}
	this.fSrlDwn.onmouseout = function(){
		this.fMgr.fSpeed = 0;
	}
	const vSrlDwnBtn = slideshow.xAddBtn(this.fSrlDwn, "tocSrlDwnBtn", slideshow.xGetStr(6), slideshow.xGetStr(7));
	vSrlDwnBtn.fMgr = this;
	vSrlDwnBtn.onclick = function(){
		this.fMgr.step(20);
		if (scPresMgr.xResetFocus) scPresMgr.xResetFocus();
		return false;
	}
	// Init scroll manager
	this.checkBtn();
	scSiLib.addRule(pScrollNode, this);
	pScrollNode.onscroll = function(){this.fMgr.checkBtn()};
	pScrollNode.onmousewheel = function(){this.fMgr.step(Math.round(-event.wheelDelta/(scCoLib.isIE ? 60 : 40)))}; //IE, Safari, Chrome, Opera.
	if(pScrollNode.addEventListener) pScrollNode.addEventListener('DOMMouseScroll', function(pEvent){this.fMgr.step(pEvent.detail)}, false);
}
slideshow.ScrollTask.prototype = {
	fClassOffUp : "btnOff",
	fClassOffDown : "btnOff",
	fSpeed : 0,
	execTask : function(){
		try {
			if(this.fSpeed === 0) return false;
			this.fScrollNode.scrollTop += this.fSpeed;
			return true;
		}catch(e){
			this.fSpeed = 0;
			return false;
		}
	},
	step: function(pPx) {
		try { this.fScrollNode.scrollTop += pPx; }catch(e){}
	},
	checkBtn: function(){
		const vScrollTop = this.fScrollNode.scrollTop;
		const vBtnUpOff = this.fSrlUp.className.indexOf(this.fClassOffUp);
		if(vScrollTop <= 0) {
			if(vBtnUpOff < 0) this.fSrlUp.className+= " "+this.fClassOffUp;
		} else {
			if(vBtnUpOff >= 0) this.fSrlUp.className = this.fSrlUp.className.substring(0, vBtnUpOff);
		}
		const vContentH = scSiLib.getContentHeight(this.fScrollNode);
		const vBtnDownOff = this.fSrlDwn.className.indexOf(this.fClassOffDown);
		if( vContentH - vScrollTop <= this.fScrollNode.offsetHeight){
			if(vBtnDownOff < 0) this.fSrlDwn.className+= " "+this.fClassOffDown;
		} else {
			if(vBtnDownOff >=0) this.fSrlDwn.className = this.fSrlDwn.className.substring(0, vBtnDownOff);
		}
	},
	onResizedAnc : function(pOwnerNode, pEvent){
		if(pEvent.phase===2) this.checkBtn();
	},
	onResizedDes : function(pOwnerNode, pEvent) {
	},
	ruleSortKey : "checkBtn"
}

slideshow.EnsureVisibleTask = function (pPathNode, pContainer) {
	//sc size rule that ensures a given node is visible in it's container
	this.fPathNode = pPathNode;
	this.fContainer = pContainer;
	scOnLoads[scOnLoads.length] = this;
}
slideshow.EnsureVisibleTask.prototype = {
	onLoad : function() {
		try {
			this.resetNode();
			scSiLib.addRule(this.fContainer, this);
		} catch(e){scCoLib.logError("ERROR EnsureVisibleTask.onLoad",e);}
	},
	onResizedAnc : function(pOwnerNode, pEvent) {
		if(pEvent.phase===1 || pEvent.resizedNode === pOwnerNode) return;
		this.ensureVis();
	},
	onResizedDes : function(pOwnerNode, pEvent) {
		if(pEvent.phase===1) return;
		this.ensureVis();
	},
	resetNode : function() {
		this.fNode = scPaLib.findNode(this.fPathNode, this.fContainer);
		this.ensureVis();
	},
	initTask : function(pTargetScrollTop) {
		this.fTargetScrollTop = pTargetScrollTop;
		try{
			this.fEndTime = ( Date.now ? Date.now() : new Date().getTime() ) + 100;
			this.fCycles = Math.min(25, Math.max(10, Math.round(Math.abs(this.fContainer.scrollTop - this.fTargetScrollTop)/ 10)));
			scTiLib.addTaskNow(this);
		}catch(e){scCoLib.log("ERROR EnsureVisibleTask.initTask: "+e);}
	},
	execTask : function() {
		try{
			if (!scPresMgr.fEnableEffects) {
				this.precipitateEndTask();
				return false;
			}
			const vNow = Date.now ? Date.now() : new Date().getTime();
			while(this.fEndTime < vNow && this.fCycles >0) {
				//On saute des steps si le processor est trop lent.
				this.fCycles--;
				this.fEndTime += 100;
			}
			this.fCycles--;
			if(this.fCycles <= 0) {
				this.precipitateEndTask();
				return false;
			} else {
				this.fEndTime += 100;

				const vCurrScrollTop = this.fContainer.scrollTop;
				const vNewScrollTop = vCurrScrollTop - (2 * (vCurrScrollTop - this.fTargetScrollTop) / (this.fCycles + 1));
				this.fContainer.scrollTop = vNewScrollTop;
				return true;
			}
		}catch(e){scCoLib.log("ERROR EnsureVisibleTask.execTask: "+e);}
	},
	precipitateEndTask : function() {
		try{
			this.fContainer.scrollTop = this.fTargetScrollTop;
		}catch(e){scCoLib.log("ERROR EnsureVisibleTask.precipitateEndTask: "+e);}
	},
	ensureVis : function() {
		if( !this.fNode) return;
		try{
			let vParent = this.fNode.offsetParent;
			if( !vParent || vParent.tagName.toLowerCase() === "body") return;
			let vOffset = this.fNode.offsetTop;
			while(vParent !== this.fContainer) {
				const vNewParent = vParent.offsetParent;
				vOffset += vParent.offsetTop;
				vParent = vNewParent;
			}
			const vOffsetMiddle = vOffset + this.fNode.offsetHeight / 2;
			const vMiddle = this.fContainer.clientHeight / 2;
			this.initTask(vOffsetMiddle - vMiddle);
		} catch(e) {scCoLib.log("ERROR EnsureVisibleTask.ensureVis: "+e)}
	},
	loadSortKey : "SiZ",
	ruleSortKey : "Z"
}
