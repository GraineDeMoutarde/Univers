var gulp = require('gulp');
var gutil = require('gulp-util');
var tap = require('gulp-tap');
var MarkdownIt = require('markdown-it');
var container = require('markdown-it-container');
var flatten = require('gulp-flatten');
var yamlParser = require('markdown-yaml-metadata-parser');
var path = require('path');
var fs = require('fs');
var writeJson = require('write-json');

var md = new MarkdownIt({
    html: true,
    linkify: false,
    typographer: true
  });
md.use(container, 'container');
md.use(require('markdown-it-sup'));
md.use(require('markdown-it-sub'));
md.use(require('markdown-it-footnote'));
md.use(require('markdown-it-headinganchor'));
md.use(require('markdown-it-imsize'), {autofill: true});
md.use(container, 'title', {
    render: function(tokens, idx) {
        var content = tokens[idx].info.trim().split(" ");
        // console.log(content);
        // return "";
        if (tokens[idx].nesting === 1) {
            //get the correct href --- content[2] is the folder depth
            // console.log(content[content.length-1]);
            folder_up = "../".repeat(parseInt((content[content.length-1])));
            return "<!DOCTYPE html>\n        <html lang=\"fr\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">\n"+
            "<link rel=\"stylesheet\" href=\"" +
            folder_up + "node_modules/bootstrap/dist/css/bootstrap.min.css\" type=\"text/css\">\n"+       
            // "<link rel=\"stylesheet\" href=\"" + folder_up +"ressources/style.css\">"+            
            "<title>" + content.slice(1, -1).join(" ") + "</title>\n";
            
        } else {
            return "        </head>\n"
        }
    }
})

gulp.task('default', function() {
    return gulp.src('Encyclopédie/**/*.md')
        .pipe(tap(markdownToHtml))
        .pipe(flatten())
        .pipe(gulp.dest('./website'));
});

gulp.task('test', function() {
    return gulp.src('**/test.md')
    .pipe(tap(markdownToHtml))
    .pipe(flatten())
    .pipe(gulp.dest('test'));
})

function markdownToHtml(file) {
    var source = file.contents.toString().replace(/\r\n/g, "\n");
    var parsed = yamlParser(source);
    var body = md.render(parsed.content);
    // changes every md link into html link
    body = body.replace(/\.md/g, ".html");
    var content = createNav(parsed.metadata, file.relative, body);
    file.contents = new Buffer(content);
    file.path = gutil.replaceExtension(file.path, '.html');
    return;
}

function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
 }

gulp.task('writeSearchFile', ()=> {
    writeSearchFile();
    return;
})

function writeSearchFile() {
    let _pathArray = walk('Encyclopédie');
    let _nameArray = []
    for (let i=0; i<_pathArray.length; i++) {
        _pathArray[i] = path.basename(_pathArray[i]).replace(".md", ".html");
        _nameArray.push(titleCase(path.basename(_pathArray[i]).replace("_", " ").replace(".html", "")));
    }
    let file = 'website/ressources/searchDict.json'
    writeJson(file, {
        pathArray: _pathArray,
        nameArray: _nameArray
    });
}

var walk = function(dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            /* Recurse into a subdirectory */
            results = results.concat(walk(file));
        } else { 
            /* Is a file */
            results.push(file);
        }
    });
    return results;
}

function createNav(metadata, relativePath, body) {
    var base = path.dirname(relativePath);
    let categoryList = base.split("\\");
    // for (var i=sameCategory.length-1; i>=0; i--) {
    //     if (path.basename(sameCategory[i]) == path.basename(relativePath)) {
    //         sameCategory.splice(i, 1);
    //     }
    // }
    
    
    var categoryString ="";
    for (var i=0; i<categoryList.length; i++) {
        var liItems = "";
        let directory = "./Encyclopédie/" + categoryList.slice(0, i+1).join('/');
        files = fs.readdirSync(directory).filter(f => f.includes(".md"));
        if (files) {
            for (let i=0; i<files.length; i++) {
                let file = files[i];
                if (file != path.basename(relativePath)) {
                    let filename = file.replace(".md", "");
                    let link = filename + ".html";
                    let liItem = `          <li><button class=\"btn btn-block\" onclick=\"location.href='${link}'\" type=\"link\">${titleCase(filename.replace(/_/g, " "))}</button></li>`
                    liItems+=liItem+"\n";
                }
            }
        }
        //console.log(liItems);
        category_i = titleCase(categoryList[i].replace("_", " "));
        categoryString = categoryString + `
        <li>
            <button class="category-btn btn btn-block" href="#" onclick="dropdown('${categoryList[i]}')"><b>${category_i}</b></button>
            <ul class="categoryContent" id=${categoryList[i]}>
            ${liItems}
            </ul>
        </li>`;
    }

    var result = `<!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <link rel="stylesheet" href="ressources//bootstrap.min.css" type="text/css">

        <link rel="stylesheet" href="ressources/style.css">
        <title>${metadata.title}</title>
    </head>
    <body>
    <nav class="nav box-shadow">
        <div id="navheader">
            <h1 class="bright">Univers</h1>
        </div>
        <div>
        <div class="input-group">
        <div class="autocomplete">
            <input type="text" class="form-control" placeholder="..." id="search" onchange="getAutocomplete()" onkeypress="getAutocomplete()" >
            <div id="autocomplete-items">
            </div>
        </div>
    </div><!-- /input-group -->
        </div>
        <div id="category">
            <h2 class="bright">Catégories:</h2>
            <ul>
                ${categoryString}
            </ul>
        </div>
    </nav>`;

    result = result + `
    <div class="content box-shadow" style="left: 300px">
    <button href=# id="navbutton" class="btn btn-outline-light" type="button" onclick="toggleSideBar()">
        &#x25C0;
    </button>
    ${body}
    </div>
    <script src="ressources/bootstrap.min.js"></script>
    <script src="ressources/jquery.min.js"></script>
    <script src="ressources/script.js"></script>
    <script src="ressources/searchDict.js"></script>
    <script src="ressources/alternateImageFloat.js"></script>
    </body>
    </html>
    `;

    return result;
}

gulp.task('watch', function() {
    gulp.watch('**/*.md', ['default']);
});

gulp.task('toc', function() {
    return gulp.src('Encyclopédie/**/*.md')
      .pipe(toc({index: 'main.md'}))
      .pipe(gulp.dest('./Encyclopédie'));
  });