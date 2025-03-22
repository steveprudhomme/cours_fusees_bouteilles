window.dys = {
	fStrings : [
		/*00*/ "⚙","Afficher / cacher les options accessibilité",
		/*02*/ "Police OpenDyslexic","Activer / désactiver l\'usage de la police OpenDyslexic",
		/*04*/ "Lignes colorées","Activer / désactiver les lignes de textes en couleurs alternés",
		/*06*/ "Texte aéré","Activer / désactiver un plus grand espacement du texte",
		/*08*/ "-","Diminuer la taille de la police",
		/*10*/ "+","Augmenter la taille de la police",
		/*12*/ "Titres numérotés","Activer / désactiver la numérotation des titres",
		/*14*/ "Titres à l\'échelle","Activer / désactiver la mise à l\'échelle des titres des pages en fonction de leur profondeur",
		""],
	fPanelActive : false,
	fFontActive : false,
	fMoreSpace : false,
	fFontSize : 100,
	fAltLineColor : false,
	fNumHeadings : false,
	fScaleH2 : false,
	fListeners : [],

	init : function(pOptions) {
		try {
			this.fStore = new this.LocalStore();
			if (pOptions) this.fOptions = pOptions;
			else throw "Cannot find configuration object";
			this.fBody = scPaLib.findNode("bod:");
			this.fRoot = scPaLib.findNode(this.fOptions.pathRoot);
			this.fContent = scPaLib.findNode(this.fOptions.pathContent);
			if (window.parent !== window && window.parent.dys){ // We are in an iframe registered with the parent dys manager.
				if (this.fStore.get("dysFontActive")==="true") this.xToggleFont();
				if (this.fStore.get("dysMoreSpace")==="true") this.xToggleMoreSpace();
				if (this.fStore.get("dysFontSize")){
					this.fFontSize = Number(this.fStore.get("dysFontSize"));
					this.fContent.style.fontSize = this.fFontSize + "%";
				}
				if (this.fOptions.optNumHeadings && this.fStore.get("dysNumHeadings")==="true") this.xToggleNumHeadings();
				if (this.fOptions.optScaleH2 && this.fStore.get("dysScaleH2")==="true") this.xToggleScaleH2();
				if (this.fStore.get("dysAltLineColor")==="true") this.xToggleAltLineColor();
				window.parent.dys.registerListener(function (pAction) {
					if (dys[pAction]) dys[pAction]();
					else console.error("dys.listener : unknown action "+pAction);
				})
			} else if(!this.fOptions.disable) {
				this.xBuildUi();
				if (this.fStore.get("dysPanelActive")==="true" && !this.fOptions.defaultPanelInactive) this.xTogglePanel(scPaLib.findNode("des:button.dysBtnTogglePanel"));
				if (this.fStore.get("dysFontActive")==="true") this.xToggleFont(scPaLib.findNode("des:button.dysBtnToggleFont"));
				if (this.fStore.get("dysMoreSpace")==="true") this.xToggleMoreSpace(scPaLib.findNode("des:button.dysBtnToggleMoreSpace"));
				if (this.fStore.get("dysFontSize")){
					this.fFontSize = Number(this.fStore.get("dysFontSize"));
					this.fContent.style.fontSize = this.fFontSize + "%";
					this.fFontSizeLbl.innerHTML = this.fFontSize + "%";
				}
				if (this.fOptions.optNumHeadings && this.fStore.get("dysNumHeadings")==="true") this.xToggleNumHeadings(scPaLib.findNode("des:button.dysBtnToggleNumHeadings"));
				if (this.fOptions.optScaleH2 && this.fStore.get("dysScaleH2")==="true") this.xToggleScaleH2(scPaLib.findNode("des:button.dysBtnToggleScaleH2"));
				if (this.fStore.get("dysAltLineColor")==="true") this.xToggleAltLineColor(scPaLib.findNode("des:button.dysBtnToggleAltLineColor"));
			}
			scOnLoads[scOnLoads.length] = this;
		} catch (e) {
			console.error(`ERROR dys.init : ${e}`);
		}
	},
	onLoad : function() {
		try {
			if (this.fAltLineColorInit) this.xAltLineColorUpdate();
		} catch (e) {
			console.error(`ERROR dys.onLoad : ${e}`);
		}
	},
	registerListener : function(pFunc){
		if (this.fListeners) this.fListeners.push(pFunc);
	},

	/* === Private ============================================================== */
	xBuildUi : function() {
		const vBtnParent = scPaLib.findNode(this.fOptions.pathBtnParent);
		const vPanelParent = scPaLib.findNode(this.fOptions.pathPanelParent);
		if (!vBtnParent || !vPanelParent) throw "Cannot find button or panel parent element.";
		const bd = dom.newBd(vBtnParent);
		bd.elt("div", "dysBtnTogglePanel").elt("button", "dysBtnToggle").att("aria-expanded", "false").att("title", this.fStrings[1]).listen("click", function() {return dys.xTogglePanel(this)}).elt("span").text(this.fStrings[0]).up().up();
		bd.setCurrent(vPanelParent);
		bd.elt("div", "dysPanel").elt("span");
		bd.elt("span", "dysFontSizer");
		bd.elt("button", "dysBtn dysBtnFontSmaller").att("title", this.fStrings[9]).listen("click",function() {return dys.xFontSmaller()}).elt("span").text(this.fStrings[8]).up().up();
		this.fFontSizeLbl = bd.elt("span", "dysFontSizeLbl").text(this.fFontSize + "%").currentUp();
		bd.elt("button", "dysBtn dysBtnFontLarger").att("title", this.fStrings[11]).listen("click",function() {return dys.xFontLarger()}).elt("span").text(this.fStrings[10]).up().up().up();
		bd.elt("button", "dysBtnCheck_false dysBtnToggleFont").att("title", this.fStrings[3]).listen("click",function() {return dys.xToggleFont(this)}).elt("span").text(this.fStrings[2]).up().up();
		bd.elt("button", "dysBtnCheck_false dysBtnToggleAltLineColor").att("title", this.fStrings[5]).listen("click",function() {return dys.xToggleAltLineColor(this)}).elt("span").text(this.fStrings[4]).up().up();
		bd.elt("button", "dysBtnCheck_false dysBtnToggleMoreSpace").att("title", this.fStrings[7]).listen("click",function() {return dys.xToggleMoreSpace(this)}).elt("span").text(this.fStrings[6]).up().up();
		if (this.fOptions.optNumHeadings) bd.elt("button", "dysBtnCheck_false dysBtnToggleNumHeadings").att("title", this.fStrings[13]).listen("click",function() {return dys.xToggleNumHeadings(this)}).elt("span").text(this.fStrings[12]).up().up();
		if (this.fOptions.optScaleH2) bd.elt("button", "dysBtnCheck_false dysBtnToggleScaleH2").att("title", this.fStrings[15]).listen("click",function() {return dys.xToggleScaleH2(this)}).elt("span").text(this.fStrings[14]).up().up();
	},
	xAltLineColorInit : function() {
		const vTextNodes = [];
		const vIgnoreFilter = scPaLib.compileFilter(this.fOptions.ignoreFilter);
		const textNodeWalker = function (pNde) {
			while (pNde) {
				if (pNde.nodeType === 3) vTextNodes.push(pNde);
				else if (pNde.nodeType === 1 && !scPaLib.checkNode(vIgnoreFilter, pNde)) textNodeWalker(pNde.firstChild);
				pNde = pNde.nextSibling;
			}
		};
		textNodeWalker(this.fContent.firstChild);
		for (let i=0; i<vTextNodes.length; i++) {
			const vTextNode = vTextNodes[i];
			const vTextSplit = vTextNode.nodeValue.replace(/(\S+)/g, function (pWrd) {
				return '<span class="dysColor_">' + pWrd + '</span>';
			});
			const vHolder = scDynUiMgr.addElement("span", vTextNode.parentNode, null, vTextNode);
			vTextNode.parentNode.removeChild(vTextNode);
			vHolder.innerHTML = vTextSplit;
		}
		this.fAltLineColorSpans = scPaLib.findNodes("des:span.dysColor_", this.fContent);
		this.fAltLineColorInit = true;
		this.fAltLineLastColor=0;
		this.fAltLineLastVert=0;
		scSiLib.addRule(this.fRoot, {
			onResizedAnc:function(pOwnerNode, pEvent){
				if(pEvent.phase===1 || pEvent.resizedNode === pOwnerNode) return;
				dys.xAltLineColorUpdate();
			},
			onResizedDes:function(pOwnerNode, pEvent){
				if(pEvent.phase===1) return;
				dys.xAltLineColorUpdate();
			},
			ruleSortKey : "checkAltLineColor"
		});
		this.xAltLineColorUpdate();
	},
	xAltLineColorUpdate : function() {
		const getY = function (pElt) {
			const vStopFilter = scPaLib.compileFilter("body");
			for (var vY = 0; pElt != null && !scPaLib.checkNode(vStopFilter, pElt); vY += pElt.offsetTop, pElt = pElt.offsetParent) ;
			return vY;
		};
		for (let i=0; i<this.fAltLineColorSpans.length; i++) {
			const vSpan = this.fAltLineColorSpans[i];
			const vCurrVert = getY(vSpan) + vSpan.offsetHeight/2;
			if (vSpan.checkVisibility() && (this.fAltLineLastVert > vCurrVert+3 || this.fAltLineLastVert < vCurrVert-3)) {
				this.fAltLineLastVert = vCurrVert;
				this.fAltLineLastColor = (this.fAltLineLastColor + 1) % 3;
			}
			this.switchClass(vSpan, "dysColor_", "dysColor_"+this.fAltLineLastColor, false, false);
		}
	},
	xNumHeadingsInit : function() {
		this.fNumHeadingsInit = true;
		outMgr.addCounters();
		const vCurrentMenuItemCounter = scPaLib.findNode("ide:menu/des:li.sel_yes/des:span.counter");
		const vCurrentHeading = scPaLib.findNode("ide:content/des:.hBk_ti");
		const vBd = dom.newBd(vCurrentHeading);
		vBd.elt("span", "counter", vCurrentHeading.firstChild).text(vCurrentMenuItemCounter.textContent);
		const vSubPageSelector = scPaLib.findNode("ide:content/des:nav.subPageSelector/chi:ul");
		if (vSubPageSelector){
			const vMenuSubPageCounters = scPaLib.findNodes("ide:menu/des:li.sel_yes.type_b/chi:ul/des:span.counter");
			const vSubPageSelectors = scPaLib.findNodes("chi:li/chi:a/chi:span", vSubPageSelector);
			if (vSubPageSelectors.length !== vMenuSubPageCounters.length) throw "SubPageSelector / Menu mismatch."
			for (let i = 0; i < vSubPageSelectors.length; i++) {
				vBd.setCurrent(vSubPageSelectors[i]);
				vBd.elt("span", "counter", vSubPageSelectors[i].firstChild).text(vMenuSubPageCounters[i].textContent);
			}
		}
	},
	xScaleH2Init : function() {
		this.fScaleH2Init = true;
		const vMenuDepth = Math.min(scPaLib.findNodes("ide:menu/des:li.sel_yes/anc:ul.sub").length + 1, 6);
		this.fBody.classList.add("dysScaleH2_" + vMenuDepth);
	},

	xTogglePanel : function(pBtn) {
		this.fPanelActive = !this.fPanelActive;
		this.switchClass(this.fBody, "dysPanelActive_"+!this.fPanelActive, "dysPanelActive_"+this.fPanelActive, true);
		this.fStore.set("dysPanelActive", this.fPanelActive);
		pBtn.setAttribute("aria-expanded", this.fPanelActive);
		return false;
	},
	xToggleFont : function(pBtn) {
		this.fFontActive = !this.fFontActive;
		if (pBtn) {
			this.switchClass(pBtn, "dysBtnCheck_"+!this.fFontActive, "dysBtnCheck_"+this.fFontActive);
			pBtn.setAttribute("aria-pressed", this.fFontActive);
		}
		this.switchClass(this.fBody, "dysFontActive_"+!this.fFontActive, "dysFontActive_"+this.fFontActive, true);
		this.fStore.set("dysFontActive", this.fFontActive);
		if (this.fAltLineColorInit) this.xAltLineColorUpdate();
		this.xFireEvent("xToggleFont");
	},
	xToggleAltLineColor : function(pBtn) {
		this.fAltLineColor = !this.fAltLineColor;
		if (!this.fAltLineColorInit) {
			if ("mathjaxMgr" in window){
				if (mathjaxMgr.fActive && !mathjaxMgr.fReady) mathjaxMgr.register(function(){dys.xAltLineColorInit();});
				else dys.xAltLineColorInit();
			} else dys.xAltLineColorInit();
		}
		if (pBtn) {
			dys.switchClass(pBtn, "dysBtnCheck_"+!this.fAltLineColor, "dysBtnCheck_"+this.fAltLineColor);
			pBtn.setAttribute("aria-pressed", this.fAltLineColor);
		}
		this.switchClass(this.fBody, "dysAltLineColor_"+!this.fAltLineColor, "dysAltLineColor_"+this.fAltLineColor, true);
		this.fStore.set("dysAltLineColor", this.fAltLineColor);
		this.xFireEvent("xToggleAltLineColor");
	},
	xToggleMoreSpace : function(pBtn) {
		this.fMoreSpace = !this.fMoreSpace;
		if (pBtn) {
			this.switchClass(pBtn, "dysBtnCheck_"+!this.fMoreSpace, "dysBtnCheck_"+this.fMoreSpace);
			pBtn.setAttribute("aria-pressed", this.fMoreSpace);
		}
		this.switchClass(this.fBody, "dysMoreSpace_"+!this.fMoreSpace, "dysMoreSpace_"+this.fMoreSpace, true);
		this.fStore.set("dysMoreSpace", this.fMoreSpace);
		if (this.fAltLineColorInit) this.xAltLineColorUpdate();
		this.xFireEvent("xToggleMoreSpace");
	},
	xFontSmaller : function() {
		this.fFontSize -= 10;
		this.fFontSize = Math.max(this.fFontSize, 50);
		this.fContent.style.fontSize = this.fFontSize + "%";
		this.fStore.set("dysFontSize", this.fFontSize);
		if (this.fFontSizeLbl) this.fFontSizeLbl.innerHTML = this.fFontSize + "%";
		if (this.fAltLineColorInit) this.xAltLineColorUpdate();
		this.xFireEvent("xFontSmaller");
	},
	xFontLarger : function() {
		this.fFontSize += 10;
		this.fFontSize = Math.min(this.fFontSize, 200);
		this.fContent.style.fontSize = this.fFontSize + "%";
		this.fStore.set("dysFontSize", this.fFontSize);
		if (this.fFontSizeLbl) this.fFontSizeLbl.innerHTML = this.fFontSize + "%";
		if (this.fAltLineColorInit) this.xAltLineColorUpdate();
		this.xFireEvent("xFontLarger");
	},
	xToggleNumHeadings : function(pBtn) {
		this.fNumHeadings = !this.fNumHeadings;
		if (pBtn) {
			this.switchClass(pBtn, "dysBtnCheck_"+!this.fNumHeadings, "dysBtnCheck_"+this.fNumHeadings);
			pBtn.setAttribute("aria-pressed", this.fNumHeadings);
		}
		this.switchClass(this.fBody, "dysNumHeadings_"+!this.fNumHeadings, "dysNumHeadings_"+this.fNumHeadings, true);
		this.fStore.set("dysNumHeadings", this.fNumHeadings);
		if (!this.fNumHeadingsInit) {
			this.xNumHeadingsInit();
		}
		if (this.fAltLineColorInit) this.xAltLineColorUpdate();
		this.xFireEvent("xToggleNumHeadings");
	},
	xToggleScaleH2 : function(pBtn) {
		this.fScaleH2 = !this.fScaleH2;
		if (pBtn) {
			this.switchClass(pBtn, "dysBtnCheck_"+!this.fScaleH2, "dysBtnCheck_"+this.fScaleH2);
			pBtn.setAttribute("aria-pressed", this.fScaleH2);
		}
		this.switchClass(this.fBody, "dysScaleH2_"+!this.fScaleH2, "dysScaleH2_"+this.fScaleH2, true);
		this.fStore.set("dysScaleH2", this.fScaleH2);
		if (!this.fScaleH2Init) {
			this.xScaleH2Init();
		}
		if (this.fAltLineColorInit) this.xAltLineColorUpdate();
		this.xFireEvent("xToggleScaleH2");
	},

	xFireEvent : function(pParam){
		for (let i=0; i< this.fListeners.length; i++) this.fListeners[i](pParam);
	},

	/* === Utilities ============================================================ */

	/** dys.switchClass - replace a class name. */
	switchClass : function(pNode, pClassOld, pClassNew, pAddIfAbsent, pMatchExact) {
		const vAddIfAbsent = typeof pAddIfAbsent == "undefined" ? false : pAddIfAbsent;
		const vMatchExact = typeof pMatchExact == "undefined" ? true : pMatchExact;
		const vClassName = pNode.className;
		const vReg = new RegExp("\\b" + pClassNew + "\\b");
		if (vMatchExact && vClassName.match(vReg)) return;
		let vClassFound = false;
		if (pClassOld && pClassOld !== "") {
			if (vClassName.indexOf(pClassOld)===-1){
				if (!vAddIfAbsent) return;
				else if (pClassNew && pClassNew !== '') pNode.className = vClassName + " " + pClassNew;
			} else {
				const vCurrentClasses = vClassName.split(' ');
				const vNewClasses = [];
				let i = 0;
				const n = vCurrentClasses.length;
				for (; i < n; i++) {
					const vCurrentClass = vCurrentClasses[i];
					if (vMatchExact && vCurrentClass !== pClassOld || !vMatchExact && vCurrentClass.indexOf(pClassOld) < 0) {
						vNewClasses.push(vCurrentClasses[i]);
					} else {
						if (pClassNew && pClassNew !== '') vNewClasses.push(pClassNew);
						vClassFound = true;
					}
				}
				pNode.className = vNewClasses.join(' ');
			}
		}
		return vClassFound;
	},
	LocalStore : function(pId){
		if (pId && !/^[a-z][a-z0-9]+$/.exec(pId)) throw new Error("Invalid store name");
		this.fId = pId || "";
		this.fRootKey = scServices.scLoad.fRootUrl;
		if ("localStorage" in window && typeof window.localStorage != "undefined") {
			this.get = function(pKey) {
				const vRet = localStorage.getItem(this.fRootKey + this.xKey(pKey));return (typeof vRet == "string" ? unescape(vRet) : null)};
			this.set = function(pKey, pVal) {localStorage.setItem(this.fRootKey+this.xKey(pKey), escape(pVal))};
		} else {
			this.get = function(pKey){
				const vReg = new RegExp(this.xKey(pKey) + "=([^;]*)");
				const vArr = vReg.exec(document.cookie);if(vArr && vArr.length===2) return(unescape(vArr[1]));else return null};
			this.set = function(pKey,pVal){document.cookie = this.xKey(pKey)+"="+escape(pVal)};
		}
		this.xKey = function(pKey){return this.fId + this.xEsc(pKey)};
		this.xEsc = function(pStr){return "LS" + pStr.replace(/ /g, "_")};
	},
	loadSortKey : "ZZZZ"
}
dys.init(dysOptions);