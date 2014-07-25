Morfana
=======

JavaScript display engine for morphemic analysis in russian language

[Official website](http://morfana.ru/)

Demo HTML document
-----

``` html
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/jquery/1.7/jquery.min.js"></script>
	<script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/rangy/1.2.3/rangy-core.js"></script>
	<script type="text/javascript" src="http://cdn.morfana.ru/latest/morfana.min.js"></script>
</head>
<body>
	<span data-morfana-markup="ko:1-5;ok:6-6;ko:7-10;su:11-11;ok:12-13;osL:1-5;osR:7-11">десятиэтажный</span>
</body>
</html>
```    
For more demos visit [official website](http://morfana.ru/)

##Changelog
`1.1.2a` / `25.07.2014`

- Code refactoring
- Changed draw() behaviour. If elements selected with selector don't have attribute 'data-morfana-markup' Morfana trying to select their children with this attribute
- Fixed #3. Now: 'pointer-events: none' for all SVG elements used as morpheme signs.
- Added morphemes: "zero-ending" inside word, "postfix", "interrupted basis" in 3 parts
- Decreased size of vertical lines in sign of morpheme "basis"
- Added to API: Morfana.clear()
- Added to API: Morfana.getLettersBounds()

`1.0.3a` / `04.11.2013`

- Code refactoring
- Minor bug fixes

`1.0.2a` / `04.11.2013`

- Code refactoring
- Minor bug fixes

`1.0.1a` / `04.11.2013`

- Library release