(function(){
    function DateService(target){
        this.target = target;
        this.dates = {};
    }

    DateService.prototype.createItem = function(dateItemsElem, details){
        var itemElem = document.createElement('li');
        dateItemsElem.insertBefore(itemElem, dateItemsElem.firstChild);

        // Price
        var priceElem = document.createElement('span');
        priceElem.className = 'numeric price';

        var price = details.price;
        var sign = '+';
        if(price[0] === '-'){
            sign = '-';
            price = price.slice(1);
        }

        if(sign === '+'){
            priceElem.classList.add('positive');
        }
        else {
            priceElem.classList.add('negative');
        }
        priceElem.innerHTML = sign + price;

        itemElem.appendChild(priceElem);

        // Name
        var nameElem = document.createElement('span');
        nameElem.className = 'name';
        nameElem.innerHTML = details.name;
        itemElem.appendChild(nameElem);

        // meta
        var metaElem = document.createElement('span');
        metaElem.className = 'meta';
        metaElem.innerHTML = details.meta;
        itemElem.appendChild(metaElem);
    };

    DateService.prototype.createDate = function(dateItems){
        var self = this;
        var target = self.target[0];
        var date = dateItems.date;

        if(date !== undefined){
            var dateObject = self.dates[date];
            if(dateObject === undefined){
                var dateElem = document.createElement('div');
                dateElem.className = 'date';
                dateElem.dataset.date = date;

                var dateBefore = self.dateBefore(date);
                target.insertBefore(dateElem, dateBefore);

                var left = document.createElement('div');
                left.className = 'numeric date-head';
                left.innerHTML = date;
                dateElem.appendChild(left);

                var dateItemsElem = document.createElement('ul');
                dateItems.className = 'date-items';
                dateElem.appendChild(dateItemsElem);

                dateObject = {
                    dateElem: dateElem,
                    dateItemsElem: dateItemsElem
                };

                self.dates[date] = dateObject;
            }

            dateItems.items.forEach(function(details){
                self.createItem(dateObject.dateItemsElem, details);
            });
        }
    };

    DateService.prototype.loadPage = function(url){
        var self = this;
        self.target.trigger('loadPage.start', url);

        $.get(url)
        .success(function(reply){
            self.target.empty();
            self.dates = {};

            reply.items.forEach(function(dateItems){
                self.createDate(dateItems);
            });
            self.target.trigger('loadPage.end', reply);
        })
    };

    DateService.prototype.dateBefore = function(date){
        var keys = Object.keys(this.dates).sort();
        var dateBefore = null;
        for(var i=0; i<keys.length; i++){
            var dateKey = keys[i];
            if(dateKey < date){
                dateBefore = dateKey;
            }
            else {
                break
            }
        }

        if(dateBefore === null){
            return null
        }
        else {
            return this.dates[dateBefore].dateElem;
        }
    };

    // ------------------------------------------------------------------------
    var sidebarState, loadingOverlay, media, form, price, date, items, dateService,
        previousMonth, nextMonth, titleContent;

    function resetForm(){
        var lastDate = date.val();

        form[0].reset();

        date.val(lastDate);
        price.focus();
    }

    function enableInputs(state){
        if(state === undefined){
            state = false;
        }
        else {
            state = !state;
        }

        form.find('input').attr('disabled', state);
    }

    function getRawPrice(){
        price.select();
        var value = window.getSelection().toString();
        price.blur();

        var sign = value[0];

        if(!(sign === '+') && !(sign == '-')){
            value = -1 * parseFloat(value);
        }

        return value;
    }

    $(function(){
        // Setting up the UI ---------------------------------------------------
        media = window.matchMedia('(min-width: 1280px)');

        sidebarState = $('#sidebar-state');
        loadingOverlay = $('#loading-overlay');
        form = $('#item-form');
        price = $('#id_price');
        date = $('#id_date');
        items = $('#items');
        previousMonth = $('#previous-month');
        nextMonth = $('#next-month');
        titleContent = $('#title-content');

        price.focus();

        // Attaching handlers --------------------------------------------------
        media.addListener(function(){
            if(sidebarState.prop('checked')){
                var body = $(document.body);
                body.css({top: ''});
                body.removeClass('overflow');
                if(scrollBefore){
                    $(window).scrollTop(scrollBefore);
                }
                sidebarState.prop('checked', false);
            }
        });

        var scrollBefore = null;
        sidebarState.on('change', function(){
            var body = $(document.body);

            if(this.checked){
                scrollBefore = $(window).scrollTop();
                body.css({top: -1 * scrollBefore + 'px'});
                body.addClass('overflow');
            }
            else {
                body.css({top: ''});
                body.removeClass('overflow');
                $(window).scrollTop(scrollBefore);
            }
        });

        form.on('submit', function(e){
            e.preventDefault();
            var data = form.serializeArray().reduce(function(result, obj){
                result[obj.name] = obj.value;
                return result;
            }, {});

            data.price = getRawPrice();

            enableInputs(false);

            $.post('', data)
            .success(function(details){
                resetForm();
                dateService.createDate(details);
                enableInputs();
                price.focus();
            })
            .error(function(){
               enableInputs();
            });
        });

        items.on('loadPage.start', function(){
            loadingOverlay.show();
        });

        items.on('loadPage.end', function(e, reply){
            date.val(reply.initial);
            previousMonth.data('url', reply.pages.previous);
            nextMonth.data('url', reply.pages.next);
            titleContent.html(reply.title);
            loadingOverlay.hide();
        });

        items.one('loadPage.end', function(e, reply){
            document.title = 'WIMM - ' + reply.title;
        });
        
        nextMonth.on('click', function(){
            dateService.loadPage(nextMonth.data('url'));

            items.one('loadPage.end', function(e, reply){
                var current = reply.pages.current;
                history.pushState(current, '', current);
                document.title = 'WIMM - ' + reply.title;
            });
        });

        previousMonth.on('click', function(){
            dateService.loadPage(previousMonth.data('url'));

            items.one('loadPage.end', function(e, reply){
                var current = reply.pages.current;
                history.pushState(current, '', current);
                document.title = 'WIMM - ' + reply.title;
            });
        });

        window.onpopstate = function(event){
            dateService.loadPage(event.state);
        };

        // ---------------------------------------------------------------------
        dateService = new DateService(items);
        dateService.loadPage();
    });
})();
