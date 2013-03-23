/* global $z, $, setTimeout, localStream, _ */

Array.prototype.sum = function() {
  var i = this.length, r = 0;
  while(i--) {
    r += this[i];
  }
  return r;
};

var ospan = {};
var maxMathTime = 2500;

// letter span
// present letters 800 msec at a time

var practiceLetters = $z.stream({
  before: function() {
    // update progress 
    
    // show letters slide
    
  },
  trials: [
    {letters: ["F","P"]},
    {letters: ["Q","J"]},
    {letters: ["H","K","T"]},
    {letters: ["S","N","R"]}
  ],
  trialStart: function(params) {
    $z.showSlide("letter");
    
    // params is {letters: <array of letters>}
    
    var letters = params.letters,
        $letterText = $("#letter-text"),
        numLetters = letters.length;
    
    // show all the letters in order for 800ms each
    _(letters).each(function(letter, index) {
      setTimeout(function() { $letterText.text(letter) }, index * 800);
    });
    
    // after all letters have been shown, show the recall slide
    setTimeout(function() {
      $letterText.text("");
      setupRecall({
	letters: letters,
	show: "letters",
	callback: practiceLetters.end
      });
      
    }, numLetters * 800);
    
  },
  after: function() {
    $z.showSlide("math-inst-1");
  }
});

function setupRecall(options) {
  (function() {
    var correctLetters = options.letters,
        callback = options.callback,
        show = options.show;
    
    $(".recall-clicker").html("&nbsp;").unbind("click");
    $("#recall-blank").unbind("click");
    $("#recall-next").unbind("click").one("click",endRecall);
    
    $("#your-letters").text("");
    
    // call setupRecall again if clear is clicked
    $("#recall-clear").one("click", function(e) {
      setupRecall(options);
    });
    
    var n = correctLetters.length,
        responseLetters = [];
    
    function addLetter(letter) {
      responseLetters.push(letter);
      
      $("#your-letters").text(responseLetters.join(""));
      
      if (responseLetters.length == n) {
	$(".recall-clicker").unbind("click");
	$("#recall-blank").unbind("click");
      }
    }
    
    // add a letter if a recall clicker is clicked
    $(".recall-clicker").one("click", function(e) {
      // kludgy way to get the associated letter
      var letter = $(this).parent().children()[1].innerHTML;
      addLetter(letter);
      $(this).text(responseLetters.length);
    });
    
    // show feedback for 2 seconds and then end trial
    function endRecall() {
      var score = 0;
      for(var i = 0; i < n; i++) {
	if (responseLetters[i] == correctLetters[i]) {
	  score++;
	}
      }
      
      if (show == "letters") {
	$("#both-feedback-math").hide();
      } else {
	$("#both-feedback-math").show();
      }
      
      $("#correct-letters").text(score);
      $("#out-of").text(n);
      $z.showSlide("both-feedback");
      
      setTimeout(function() {
	callback({
	  length: n,
	  score: score,
	  perfect: (score == n ? 1 : 0),
	  correctLetters: correctLetters,
	  responseLetters: responseLetters
	});
      },
		 2000);
      
    }
    
    // add an underscore if the blank button was clicked 
    $("#recall-blank").click(function() {
      addLetter("-");
    });
    
    // show the recall slide
    $z.showSlide("recall");

  })();
}

var practiceMath = $z.stream({
  before: function() {
    // update progress 
  },
  trials: [
    {operation: "(1 × 2) + 1 = ?", numberPrompt: 1, promptCorrect: false},
    {operation: "(1 ÷ 1) - 1 = ?", numberPrompt: 2, promptCorrect: false},
    {operation: "(7 × 3) - 3 = ?", numberPrompt: 3, promptCorrect: false}/*
									  {operation: "(4 × 3) + 4 = ?", numberPrompt: 4, promptCorrect: true},
									  {operation: "(3 ÷ 3) + 2 = ?", numberPrompt: 5, promptCorrect: true},
									  {operation: "(2 × 6) - 4 = ?", numberPrompt: 6, promptCorrect: true},
									  {operation: "(8 × 9) - 8 = ?", numberPrompt: 7, promptCorrect: true},
									  {operation: "(4 × 5) - 5 = ?", numberPrompt: 8, promptCorrect: true},
									  {operation: "(4 × 2) + 6 = ?", numberPrompt: 9, promptCorrect: true},
									  {operation: "(4 ÷ 4) + 7 = ?", numberPrompt: 10, promptCorrect: true},
									  {operation: "(8 × 2) - 8 = ?", numberPrompt: 11, promptCorrect: true},
									  {operation: "(2 × 9) - 9 = ?", numberPrompt: 12, promptCorrect: true},
									  {operation: "(8 ÷ 2) + 9 = ?", numberPrompt: 13, promptCorrect: true},
									  {operation: "(3 × 8) - 1 = ?", numberPrompt: 14, promptCorrect: true},
									  {operation: "(6 ÷ 3) + 1 = ?", numberPrompt: 15, promptCorrect: true}*/
  ],
  trialStart: function(params) {
    var operation = params.operation,
        numberPrompt = params.numberPrompt,
        promptCorrect = params.promptCorrect;
    
    $("#math-trial-feedback").html("");
    $("#math-question-text").text(operation);
    $z.showSlide("math-question");
    
    $("#math-question-next").one("click", function(e) {
      $("#math-answer-text").text(numberPrompt);
      $z.showSlide("math-answer");
      
      var timeStart = (new Date()).getTime();
      
      // set up true and false button clicks
      $(".math-response").one("click", function(e) {
	$(".math-response").unbind("click");
	
	var rt = (new Date()).getTime() - timeStart,
	    response = (this.id == "math-true"),
	    responseDict = {response: response, rt: rt};
	
	$("#math-trial-feedback").html(response == promptCorrect ? "<span style='color: blue'>CORRECT</span>" : "<span style='color: red'>INCORRECT</span>");
	
	setTimeout(function() {
	  practiceMath.end( $.extend(responseDict, params) );
	},
		   1000
		  );
	
      }); 
    });
    
    
  },
  after: function() {
    var rts = practiceMath.completed.pluck("rt"),
        n = rts.length,
        mean = rts.sum() / n,
        sd = Math.sqrt(rts.map(function(rt) { return (rt - mean) * (rt - mean) }).sum() / n);
    
    ospan.math_time_mean = mean;
    ospan.math_time_sd = sd;
    maxMathTime = Math.ceil(mean + 2.5*sd);
    
    $z.showSlide("both-inst-1");
    
  }
});

var totalMathErrors = 0,
    totalMathProblems = 0;

var practiceBoth =
      $z.stream({
	trials: [{
	  letters: ["F","H","J","K"],
	  problems: [
	    {operation: "(1 × 2) + 1 = ?",  numberPrompt: 3,  promptCorrect: true},
	    {operation: "(1 × 2) + 1 = ?",  numberPrompt: 2,  promptCorrect: false},
	    {operation: "(1 × 2) + 1 = ?",  numberPrompt: 1,  promptCorrect: false},
	    {operation: "(1 × 2) + 1 = ?",  numberPrompt: 3,  promptCorrect: true}
	  ]
	}
		],
	after: function() {
	  $z.showSlide("end");
	},
	trialStart: function(params) {
	  var localMathErrors = 0;
	  $("#math-error-warning").hide();
	  
	  var localTrials = _(params.letters).map(function(letter, i) {
	    return $.extend( {letter: letter}, params.problems[i] );
	  });

	  localStream = $z.stream({
	    trials: localTrials,
	    trialStart: function(params1) {
	      
	      totalMathProblems++;
	      
	      var operation = params1.operation,
		  numberPrompt = params1.numberPrompt,
		  promptCorrect = params1.promptCorrect;

	      if (localMathErrors >= 3) {
		$("#math-error-warning").show();
	      }

	      $("#math-trial-feedback").html("");
	      $("#math-question-text").text(operation);
	      $z.showSlide("math-question");
	      
	      $("#letter-text").html(params1.letter);
	      
	      // after maxMathTime ms, automatically show letter
	      var timeOutId = setTimeout(function() {
		localMathErrors++;
		totalMathErrors++;
		$z.showSlide("letter");
		
		setTimeout(function() {
		  localStream.end({
		    response: null,
		    rt: -1,
		    correct: false
		  });}, 800);
	      }, maxMathTime);

	      $("#math-question-next").one("click", function(e) {
		clearTimeout(timeOutId);
		$("#math-answer-text").text(numberPrompt);
		$z.showSlide("math-answer");

		var timeStart = (new Date()).getTime();
		// set up true and false button clicks
		$(".math-response").one("click", function(e) {
		  $(".math-response").unbind("click");

		  var rt = (new Date()).getTime() - timeStart,
		      response = (this.id == "math-true"),
		      correct = (response == promptCorrect ? 1 : 0);

		  if (!correct) {
		    localMathErrors++;
		    totalMathErrors++;
		  }

		  $z.showSlide("letter");
		  setTimeout(function() { localStream.end({
		    response: response,
		    correct: correct,
		    rt: rt
		  });
					}, 800);
		});
	      });
	    },
	    after: function() {
	      $("#math-error-warning").hide();
	      $("#math-percentage").hide();
	      
	      if (totalMathProblems > 0) {
		$("#math-percentage-text").text(
		  Math.round((totalMathProblems - totalMathErrors) / totalMathProblems * 100) + "%"
		);
	      }
	      
	      var m = localStream.completed,
		  responses = m.pluck("response"),
		  corrects = m.pluck("correct"),
		  rts = m.pluck("rt"),
		  totalErrors = _(corrects).filter(function(x) { return !x }).length,
		  speedErrors = _(rts).filter(function(x) {  return x < 0; }).length,
		  accuracyErrors = totalErrors - speedErrors;
	      
	      $("#math-total-errors").text(totalErrors);
	      
	      $("#math-percentage").show();
	      
	      setupRecall({
		letters: params.letters,
		show: "both",
		callback: function(recallProps) {
		  var v = recallProps;
		  
		  practiceBoth.end({
		    recallScore: v.score,
		    recallPerfect: v.perfect,
		    correctLetters: v.correctLetters,
		    responseLetters: v.responseLetters,
		    mathResponses: responses,
		    mathCorrects: corrects,
		    mathRts: rts,
		    mathAccuracyErrors: accuracyErrors,
		    mathSpeedErrors: speedErrors,
		    mathTotalErrors: totalErrors
		  });
		  
		  $("#math-percentage").hide();
		}
	      });
	      
	    }
	  });
	  
	  localStream.start();
	}
      });



//practiceMath.start()
//$z.showSlide("both-inst-1");
$z.showSlide("letter-inst-1");
//$z.showSlide("math-inst-1");




