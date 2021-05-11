		var timer=null
		var notes=[]

		var canvasElement = document.getElementById("canvas");
		var rect = canvasElement.getBoundingClientRect();
		canvasElement.addEventListener("click",mouseactivated)
		canvasElement.addEventListener("mousedown",longpress)
		canvasElement.addEventListener("mouseup",longcancel)
		canvasElement.addEventListener("mousemove",longcancel)


		document.getElementById("undo").addEventListener("click", function() { notes.pop(); drawtext();});
		document.getElementById("save").addEventListener("click",save)
		document.getElementById("load").addEventListener("click",load)
		document.getElementById("exportlist").addEventListener("click",exportlist)
		document.getElementById("bookmark").addEventListener("click",bookmark)
		document.getElementById("restore").addEventListener("click",restore)


		var infCanvas = new InfiniteCanvas(canvasElement);
		// var infCanvas = canvasElement
		// infCanvas.addEventListener('draw', drawtext)

		infCanvas.greedyGestureHandling = true;

		var ctx = infCanvas.getContext("2d");

		drawunderlay()

		// roundRect(ctx, 5, 5, 50, 50);
		// wrapText(ctx, "hello this is a long sentence", 100, 100, 80, 20)


		function bookmark(event) {
			console.log('saving bookmark')
			ctx.save()
		}

		function restore(event) {
			console.log('restoring bookmark')
			ctx.restore()
			drawtext()
		}


		function longpress(event) {
			timer=setTimeout(longactivated,2000,event)
			console.log("mousedown")

		}

		function longactivated(event) {
			console.log("longactivated" + event)
			addtext(event)
		}

		function longcancel(event) {
			clearTimeout(timer)
		}


		function drawunderlay() {
			ctx.fillStyle = "rgba(0, 0, 0, 1)";
			ctx.lineWidth = 10;

			// Wall
			ctx.strokeRect(75, 140, 150, 110);

			// Door
			ctx.fillRect(130, 190, 40, 60);

			// Roof
			ctx.beginPath();
			ctx.moveTo(50, 140);
			ctx.lineTo(150, 60);
			ctx.lineTo(250, 140);
			ctx.closePath();
			ctx.stroke();
		}

		function save() {
			savetext=JSON.stringify(notes)
			console.log(savetext)
			downloadToFile(savetext,'MyInfiniteZoomTree.txt','text/plain')
		}

		function load() {

			console.log('loading')
			var file = document.getElementById('fileItem').files[0]

		  	const reader = new FileReader();
		  	reader.readAsText(file);
	    	console.log(file);

		 	reader.onload = function() {
		 		res=reader.result
			    console.log(res);
			    notes=JSON.parse(res)
		    	drawtext()
			};

		}


		function exportlist () {
			list=document.getElementById("list")
			text=''
			for (i of notes) {
				text+=i.text+'<br>'

			}
			list.innerHTML=text

		}

		const downloadToFile = (content, filename, contentType) => {
		  const a = document.createElement('a');
		  const file = new Blob([content], {type: contentType});
		  
		  a.href= URL.createObjectURL(file);
		  a.download = filename;
		  a.click();

			URL.revokeObjectURL(a.href);
		};

		function mouseactivated(event) {
			if (!event.ctrlKey) {
				return
			}
			addtext(event)
		}

		function addtext(event) {


			text=prompt("Note","Note");

			locx=event.layerX
			locy=event.layerY
			trans=ctx.canvasTransform.viewBox.canvasRectangle.coordinateSystems

			scale=trans.infiniteCanvasContextBase.a
			col=50+150*Math.random();

			notes.push({'x':locx,'y':locy,'trans':trans,'col':col,'text':text}) //store note parameters in array

			drawtext()

		}

		function drawtext() {



			ctx.clearRect(0, 0, rect.width, rect.height);
			drawunderlay()

			for (i of notes) {
				drawnote(i)
			}


		}

		function drawnote(parameters) {

			t=parameters.trans.infiniteCanvasContextBase
			scale=t.a
			offsetx=t.e
			offsety=t.f

			locx=(parameters.x-offsetx)/scale
			locy=(parameters.y-offsety)/scale
			text=parameters.text

			if(!text) {
				return
			}



			col=parameters.col

			ctx.font = 12/scale+"px Verdana";


			ctx.fillStyle = "rgba(0, 0, 0, 1)";
			x=locx+10/scale
			y=locy+20/scale
			// ctx.fillText(text,x,y)

			maxWidth=80/scale
			lineHeight=15/scale

			fullHeight=wrapText(ctx, text, x, y, maxWidth, lineHeight)

		    ctx.fillStyle = "rgba("+col+", 50, "+col+", 0.6)";
			width = ctx.measureText(text).width+(20/scale)
			height = lineHeight * 2

			ctx.fillRect(locx, locy, idealWidth(), fullHeight);

			// rad=2.10; roundRect(ctx,locx, locy, width, height, {tl: rad,br: rad,tr:rad,bl:rad},true,false);

		}

		function idealWidth() {
			if (width<maxWidth) {
				return(width)
			} 
			else {
				return(maxWidth+20/scale)
			}
		}


		function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
		  if (typeof stroke === 'undefined') {
		    stroke = true;
		  }
		  if (typeof radius === 'undefined') {
		    radius = 5;
		  }
		  if (typeof radius === 'number') {
		    radius = {tl: radius, tr: radius, br: radius, bl: radius};
		  } else {
		    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
		    for (var side in defaultRadius) {
		      radius[side] = radius[side] || defaultRadius[side];
		    }
		  }
		  ctx.beginPath();
		  ctx.moveTo(x + radius.tl, y);
		  ctx.lineTo(x + width - radius.tr, y);
		  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
		  ctx.lineTo(x + width, y + height - radius.br);
		  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
		  ctx.lineTo(x + radius.bl, y + height);
		  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
		  ctx.lineTo(x, y + radius.tl);
		  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
		  ctx.closePath();
		  if (fill) {
		    ctx.fill();
		  }
		  if (stroke) {
		    ctx.stroke();
		  }

		}

		function wrapText(context, text, x, y, maxWidth, lineHeight) {
			var words = text.split(' ');
			var line = '';

			starty=y

			for(var n = 0; n < words.length; n++) {
			  var testLine = line + words[n] + ' ';
			  var metrics = context.measureText(testLine);
			  var testWidth = metrics.width;
			  if (testWidth > maxWidth && n > 0) {
			    context.fillText(line, x, y);
			    line = words[n] + ' ';
			    y += lineHeight;
			  }
			  else {
			    line = testLine;
			  }
			}
			context.fillText(line, x, y);
			return(y-starty+lineHeight*2)
		}
