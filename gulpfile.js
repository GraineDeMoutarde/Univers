var gulp = require('gulp');
var gutil = require('gulp-util');
var tap = require('gulp-tap');
var MarkdownIt = require('markdown-it');
var flatten = require('gulp-flatten');
var yamlParser = require('markdown-yaml-metadata-parser');
var path = require('path');
var fs = require('fs');

var md = new MarkdownIt({
    html: true,
    linkify: false,
    typographer: true
  });
// Markdown it plugins for formatting  
md.use(container, 'container');
md.use(require('markdown-it-sup'));
md.use(require('markdown-it-sub'));
md.use(require('markdown-it-footnote'));
md.use(require('markdown-it-headinganchor'));
md.use(require('markdown-it-imsize'), {autofill: true});

// default builds the encyclopedia website
gulp.task('default', function() {
    return gulp.src('Encyclopédie/**/*.md')  // Taking all md files in encyclopedia
        .pipe(tap(markdownToHtml))  // Converting them into html
        .pipe(flatten())  // don't use the folder hierarchy in order to make the link system flexible
        .pipe(gulp.dest('./website')); //pipe them into the dest folder
});

// same as default but just for any test.md
gulp.task('test', function() {
    return gulp.src('**/test.md')
    .pipe(tap(markdownToHtml))
    .pipe(flatten())
    .pipe(gulp.dest('test'));
})

function markdownToHtml(file) {
    // Converts md *file* into html file;
    var source = file.contents.toString().replace(/\r\n/g, "\n"); // replacing weird newlines
    var parsed = yamlParser(source); // parsing the file into an object
    var body = md.render(parsed.content); // use Markdown-It (and all the plugins) to render the html
    // changes every md link into html link globally
    body = body.replace(/\.md/g, ".html");
    var content = createNav(parsed.metadata, file.relative, body); // create the navigation part thanks to the metadata (relative path is used for category detection)
    file.contents = new Buffer(content);
    file.path = gutil.replaceExtension(file.path, '.html'); // Change .md to .html
    return;
}

function titleCase(str) {
    // Uppercases *str* on each word
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    // Directly return the joined string
    return splitStr.join(' '); 
 }

function createNav(metadata, relativePath, body) {
    // Returns the html file as a string based on metadata, relative path and body content
    var base = path.dirname(relativePath); // get away the file name
    let categoryList = base.split("\\"); // List of all folders in path
    metadata.customCategories.forEach(customCategory => {
        categoryList.push(customCategory);
    })
    
    // Looping for every category, adding a li item for every Category
    var categoryString ="";
    for (var i=0; i<categoryList.length; i++) {
        var liItems = "";
        let directory = "./Encyclopédie/" + categoryList.slice(0, i+1).join('/');
        files = fs.readdirSync(directory).filter(f => f.includes(".md"));
        if (files) {
            // if there are files in the category loop for all of them and add links
            for (let i=0; i<files.length; i++) {
                let file = files[i];
                if (file != path.basename(relativePath)) {
                    let filename = file.replace(".md", "");
                    let link = filename + ".html";
                    let liItem = `          <li><button class=\"btn btn-block\" onclick=\"location.href='${link}'\" type=\"link\">${titleCase(filename.replace(/_/g, " "))}</button></li>`
                    liItems+=liItem+"\n";
                }
            }
        } else {
            // Else, use the metadata customCategory
            // Goal, use a custom task to write a file of the type: 
            // {"customCategory": ["path1", "path2"]}
            console.log("Custom categories not implemented yet");
        }
        //console.log(liItems);
        category_i = titleCase(categoryList[i].replace("_", " "));
        categoryString = categoryString + `
        <li>
            <button class="category-btn btn btn-block" href="#" onclick=dropdown("${categoryList[i]}")><b>${category_i}</b></button>
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
        <link rel="stylesheet" href="../node_modules/bootstrap/dist/css/bootstrap.min.css" type="text/css">

        <link rel="stylesheet" href="../ressources/style.css">
        <title>${metadata.title}</title>
    </head>
    <body>
    <nav class="nav box-shadow">
        <div id="navheader">
            <h1 class="bright">Navigation</h1>
        </div>
        <div>
            <h2 class="bright">Rechercher</h2>
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
    <script src="../node_modules/bootstrap/dist/js/bootstrap.min.js"></script>
    <script src="../node_modules/jquery/jquery.min.js"></script>
    <script src="../ressources/script.js"></script>
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