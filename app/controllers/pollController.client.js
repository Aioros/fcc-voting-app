$(function() {
    
    var apiUrl = appUrl + '/api/user/polls';
    var pollChart;
    
    if ($("body").hasClass("poll")) {
        var drawChart = function() {
            var labels = [];
            var data = [];
            var colors = [];
            $(".options .option").each(function() {
                labels.push($(this).text());
                data.push($(this).attr("data-count"));
                colors.push("rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")");
            });
            pollChart = new Chart("chart", {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Votes',
                        data: data,
                        backgroundColor: colors
                    }]
                }
            });
        };
        drawChart();
        
        var rebuildChart = function() {
            if (pollChart) {
                pollChart.destroy();
            }
            drawChart();
        }
        
        $(".option").click(function() {
            var self = this;
            var pollId = $(this).closest(".container").attr("data-id");
            var optionId = $(this).attr("data-id");
            $.post(appUrl + '/api/polls/' + pollId, {id: optionId}, function(result) {
                if (result.status) {
                    $(self).attr("data-count", result.poll.options.find(el => el._id == optionId).votes.length);
                    rebuildChart();
                } else {
                    alert("You already voted in this poll");
                }
            });
        });
        
        $("#vote").click(function() {
            var pollId = $(this).closest(".container").attr("data-id");
            var text = $("#new_option").val();
            if (text !== "") {
                $.post(appUrl + '/api/polls/' + pollId, {text: text}, function(result) {
                    if (result.status) {
                        var option = result.poll.options[result.poll.options.length - 1];
                        var lastOptionEl = $(".option:last");
                        var optionEl = lastOptionEl.clone();
                        optionEl.text(option.text);
                        optionEl.attr("data-id", option._id);
                        optionEl.attr("data-count", option.votes.length);
                        optionEl.insertAfter(lastOptionEl);
                        rebuildChart();
                    } else {
                        alert("You already voted in this poll");
                    }
                    $("#new_option").val("");
                });
            } 
        });
        
        $("#share").click(function() {
            var link = "https://twitter.com/intent/tweet?url="+encodeURI(window.location.href)+"&text="+encodeURIComponent($(".poll-title").text()+" | FCC Voting App");
            console.log(link);
            window.open(link, '_blank', 'width=600,height=300');
            return false;
        });
    }
    
    $("#add_option").click(function() {
        var index = $(".poll-options .poll-option:not(.placeholder)").length;
        var option = $(".poll-options .placeholder").clone().removeClass("placeholder");
        option.attr("name", option.attr("name").replace("[]", "["+index+"]"));
        option.appendTo(".poll-options");
    });
    
    $("#create").click(function() {
        var options = [];
        $(".poll-option:not(.placeholder)").each(function() {
            if ($(this).val() !== "") {
                options.push({
                    text: $(this).val(),
                    votes: 0
                });
            }
        });
        var poll = {
            title: $("#poll_title").val(),
            options: options
        };
        
        $.post(apiUrl, poll, function() {
            window.location.href = "/";
        });
        
        return false;
    });
    
    $("#delete").click(function() {
        if (confirm("Are you sure you want to delete this poll?")) {
            $.ajax({
                url: apiUrl + '/' + $(this).attr("data-id"),
                method: 'DELETE',
                success: function() {
                    window.location.href = "/";
                }
            });
        }
    });
    
});