.PHONY: doc
doc: doc/deploy.png
doc/deploy.png: index.drawio
	draw.io -x -f png -p 3 -o doc/deploy.png index.drawio
