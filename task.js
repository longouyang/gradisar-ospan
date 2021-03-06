/* global $z, $, setTimeout, clearTimeout, innerStream, _, log, urlParams, location, Base64 */

Array.prototype.sum = function() {
  var i = this.length, r = 0;
  while(i--) {
    r += this[i];
  }
  return r;
};

var wait = function(msec, fn) {
  setTimeout(fn, msec);
};


function setupRecall(options) {
  (function() {
    var correctWords = options.words,
        callback = options.callback,
        show = options.show;

    $("#recall-text").val("");
    
    // show feedback for 2 seconds and then end trial
    function endRecall() {
      var recallText = $("#recall-text").val(),
          responseWords = recallText.split("\n").map(function(y) { return y.toLowerCase() }),
          n = correctWords.length,
          score = 0;

      for(var i = 0; i < n; i++) {
        if (responseWords[i] == correctWords[i]) {
          score++;
        }
      }
      
      // if (show == "words") {
      //   $("#both-feedback-math").hide();
      // } else {
      //   $("#both-feedback-math").show();
      // }
      
      $("#correct-words").text(score);
      $("#out-of").text(n);
      $z.showSlide("blank");
      
      wait(500,
           function() {
             callback({
               length: n,
               score: score,
               perfect: (score == n ? 1 : 0),
               correctWords: correctWords,
               responseWords: responseWords
             });
           });
      
    }

    $("#end-recall").one("click", endRecall);
    
    // show the recall slide
    $z.showSlide("recall"); 
    
  })();
}

var getOuterStream = function(params0) {
  var totalMathErrors = 0,
      totalMathProblems = 0;

  var stream =
        $z.stream({
	        trials: params0.trials,
	        after: params0.after,
	        trialStart: function(params) {
	          var localMathErrors = 0;
	          $("#math-error-warning").hide();
	          
	          var localTrials = _(params.words).map(function(word, i) {
	            return $.extend( {word: word}, params.problems[i] );
	          });

	          var innerStream = $z.stream({
	            trials: localTrials,
              after:  function() {
                $("#math-error-warning").hide();
                $("#math-percentage").hide();
                
                if (totalMathProblems > 0) {
                  $("#math-percentage-text").text(
                    Math.round((totalMathProblems - totalMathErrors) / totalMathProblems * 100) + "%"
                  );
                }
                
                var m = innerStream.completed,
                    responses = m.pluck("response"),
                    corrects = m.pluck("correct"),
                    rts = m.pluck("rt"),
                    totalErrors = _(corrects).filter(function(x) { return !x }).length,
                    speedErrors = _(rts).filter(function(x) {  return x < 0; }).length,
                    accuracyErrors = totalErrors - speedErrors;
                
                $("#math-total-errors").text(totalErrors);
                
                // $("#math-percentage").show();
                
                setupRecall({
                  words: params.words,
                  show: "both",
                  callback: function(recallProps) {
                    var v = recallProps;
                    
                    stream.end({
                      length: v.length,
                      recallScore: v.score,
                      recallPerfect: v.perfect,
                      correctWords: v.correctWords,
                      responseWords: v.responseWords,
                      mathResponses: responses,
                      mathCorrects: corrects,
                      mathRts: rts,
                      mathAccuracyErrors: accuracyErrors,
                      mathTotalErrors: totalErrors
                    });
                    
                    $("#math-percentage").hide();
                  }
                });
                
              },
	            trialStart: function(params1) {
                var prompt = params1.prompt,
		                promptCorrect = params1.promptCorrect,
                    word = params1.word;

                $("#math-prompt").text(prompt);
                $("#word-text").text("");
                
	              $z.showSlide("math");
	              totalMathProblems++;

	              if (localMathErrors >= 3) {
		              // $("#math-error-warning").show();
	              }

                var timeStart = (new Date()).getTime();

	              // set up true and false button clicks
                var keyHandler = function(e) {
                  var keyCode = e.which;
                  if (!(keyCode == 80 || keyCode == 81)) {
                    $(document).one("keydown", keyHandler);
                  } else {
                    var rt = (new Date()).getTime() - timeStart,
		                    response = (keyCode == 80 ? true : false),
		                    correct = (response == promptCorrect ? 1 : 0);

		                if (!correct) {
		                  localMathErrors++;
		                  totalMathErrors++;
		                }

                    $("#word-text").text(word);
		                $z.showSlide("word");
		                wait(1000, function() {
                      innerStream.end({
		                    response: response,
		                    correct: correct,
		                    rt: rt
		                  });
		                });
                  }
                };

                $(document).one("keydown", keyHandler);
                
	            }
	          });
	          
	          innerStream.start();
	        }
        });

  return stream;

};



var trials1 = [{words: ["disc","form"],
                problems: [
                  {prompt: "10 - 3 = 7", promptCorrect: true},
                  {prompt: "40 + 50 = 80", promptCorrect: false}
                ]}],
    trials2 = [{words: ["germ","yard"],
                problems: [
                  {prompt: "56 + 2 = 54", promptCorrect: false},
                  {prompt: "14 / 2 = 7", promptCorrect: true}
                ]}],
    stream1 = getOuterStream({trials: trials1,
                              after: function() {
                                $z.showSlide("feedback1");
                              }
                             }), 
    stream2 = getOuterStream({trials: trials2,
                              after: function() {
                                $z.showSlide("feedback2");
                              }
                             });

var allWords = ["arch","horn","crab","vine","note",
                "fort","seal","joke","clay","camp",
                "palm","dart","whip","cube","hive",
                "cage","pest","tape","hail","tide"],
    allMath = [
      {prompt: "24 + 3 = 27", promptCorrect: true, gradeLevel: 31},
      {prompt: "18/3 = 7", promptCorrect: false, gradeLevel: 46},
      {prompt: "45 + 2 = 48", promptCorrect: false, gradeLevel: 32},
      {prompt: "24 - 17 = 7", promptCorrect: true, gradeLevel: 41},
      {prompt: "7 x 6 = 41", promptCorrect: false, gradeLevel: 52},
      {prompt: "18 - 7 = 11", promptCorrect: true, gradeLevel: 33},
      {prompt: "18 + 15 = 33", promptCorrect: true, gradeLevel: 43},
      {prompt: "8 x 7 = 55", promptCorrect: false, gradeLevel: 38},
      {prompt: "56 - 21 = 45", promptCorrect: false, gradeLevel: 54},
      {prompt: "68 + 9 = 77", promptCorrect: true, gradeLevel: 35},
      {prompt: "2 x 9 = 21", promptCorrect: false, gradeLevel: 44},
      {prompt: "7 x 5 = 35", promptCorrect: true, gradeLevel: 37},
      {prompt: "13 + 15 = 29", promptCorrect: false, gradeLevel: 42},
      {prompt: "44 + 35 = 89", promptCorrect: false, gradeLevel: 56},
      {prompt: "12 - 3 = 8", promptCorrect: false, gradeLevel: 34},
      {prompt: "6 x 6 = 36", promptCorrect: true, gradeLevel: 45},
      {prompt: "23 + 9 = 31", promptCorrect: false, gradeLevel: 36},
      {prompt: "26 + 51 = 67", promptCorrect: false, gradeLevel: 58},
      {prompt: "24/3 = 8", promptCorrect: true, gradeLevel: 47},
      {prompt: "41 + 23 = 64", promptCorrect: true, gradeLevel: 53}
    ],
    realWords = allWords.shuffle(),
    realMath = allMath.shuffle(),
    trials3 = [2,3,4,5,6].shuffle().map(function(size) {
      var words = _(realWords).first(size),
          problems = _(realMath).first(size);
      
      // bah, mutation
      realWords = realWords.slice(size);
      realMath = realMath.slice(size);
      
      return {
        size: size,
        words: words,
        problems: problems
      };
    }).concat({ // add 12-word catch trial
      size: 12,
      words: ["book","tree","face","coat","song","wind",
              "rain","shop","hall","door","seat","note"],
      problems: [
        {prompt: "11 - 2 = 9", promptCorrect: true},
        {prompt: "3 x 8 = 25", promptCorrect: false},
        {prompt: "75 - 22 = 63", promptCorrect: false},
        {prompt: "14/2 = 7", promptCorrect: true},
        {prompt: "31 + 19 = 50", promptCorrect: true},
        {prompt: "3 x 4 = 22", promptCorrect: false},
        {prompt: "34 + 12 = 46", promptCorrect: true},
        {prompt: "17 + 48 = 55", promptCorrect: false},
        {prompt: "56/8 = 8", promptCorrect: true},
        {prompt: "4 x 2 = 9", promptCorrect: false},
        {prompt: "24 - 8 = 16", promptCorrect: true},
        {prompt: "19 + 12 = 41", promptCorrect: false}
      ] 
    }),
    
    stream3 = getOuterStream({
      trials: trials3,
      after: function() {
        var completed = this.completed.filter(function(x) { return x.length < 12}),
            recallScores = completed.map(function(x) { return x.recallScore / x.correctWords.length }),
            meanRecallScore = recallScores.sum()/recallScores.length,
            mathErrors = completed.map(function(x) { return x.mathTotalErrors }).sum(),
            mathTotals = completed.map(function(x) { return x.correctWords.length }).sum(),
            mathScore = (mathTotals - mathErrors) / mathTotals,
            mathRts = [].concat.apply([], completed.pluck("mathRts")),
            meanMathRt = mathRts.sum() / mathRts.length;

        var catchTrial = this.completed[this.completed.length - 1];
        
        if (window.opener) {
          window.opener.done();
        }
        
        var payload = _.extend({
          passedCatchTrial: !catchTrial.recallPerfect,
          meanRecallScore: meanRecallScore,
          mathScore: mathScore,
          meanMathRt: meanMathRt,
          rawData: JSON.stringify(completed)
        }, urlParams);

        // post to my mock.php if for some reason i don't feel like testing
        // with GAE
        var url = (location.href.match(/static/)) ? "/api/record" : "mock.php";
        
        // TODO: ajax
        $.ajax({
          type: "POST",
          url: url,
          data: payload,
          success: function(x) {
            log(x);
            $z.showSlide("success");
          },
          error: function(xhr, ajaxOptions, thrownError) {
            log(xhr);
            $("#error textarea").val(Base64.encode(JSON.stringify(payload)));
            $z.showSlide("error");
          }
        });
      }});


$z.showSlide("instructions1");
//$z.showSlide("feedback2");
//$z.showSlide("recall");

// after real  trials



// TODO: 
// [x] launcher: read in parameters
// [x] task: read in parameters 
// [x] task: mock ajax post
// [x] task: pass through parameters from launcher to ajax post
// [x] launcher: done() function
// [v] figure out server side POST output details with Christopher
