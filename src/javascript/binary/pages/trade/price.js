/*
 * Price object handles all the functions we need to display prices
 *
 * We create Price proposal that we need to send to server to get price,
 * longcode and all other information that we need to get the price for
 * current contract
 *
 *
 * Usage:
 *
 * `socket.send(Price.createProposal())` to send price proposal to sever
 * `Price.display()` to display the price details returned from server
 */
var Price = (function () {
    'use strict';

    var typeDisplayIdMapping = {};

    var createProposal = function (typeOfContract) {
        var proposal = {proposal: 1}, underlying = document.getElementById('underlying'),
            submarket = document.getElementById('submarket'),
            contractType = typeOfContract,
            amountType = document.getElementById('amount_type'),
            currency = document.getElementById('currency'),
            payout = document.getElementById('amount'),
            startTime = document.getElementById('date_start'),
            expiryType = document.getElementById('expiry_type'),
            duration = document.getElementById('duration_amount'),
            durationUnit = document.getElementById('duration_units'),
            endDate = document.getElementById('expiry_date'),
            endTime = document.getElementById('expiry_time'),
            highBarrier = document.getElementById('barrier'),
            lowBarrier = document.getElementById('barrier1');

        if (payout && payout.value) {
            proposal['amount_val'] = payout.value;
        }
        if (amountType && amountType.value) {
            proposal['basis'] = amountType.value;
        }
        if (contractType) {
            proposal['contract_type'] = typeOfContract;
        }
        if (currency && currency.value) {
            proposal['currency'] = currency.value;
        }
        if (underlying && underlying.value) {
            proposal['symbol'] = underlying.value;
        }

        if (startTime && isVisible(startTime) && startTime.value != 'now') {
            proposal['date_start'] = startTime.value;
        }

        if (expiryType && expiryType.value == 'duration') {
            proposal['duration'] = duration.value;
            proposal['duration_unit'] = durationUnit.value;
        } else if (expiryType && expiryType.value == 'endtime') {
            proposal['date_expiry'] = moment.utc(endDate.value + " " + endTime.value).unix();
        }

        if (highBarrier && isVisible(highBarrier) && highBarrier.value) {
            proposal['barrier'] = highBarrier.value;
        }
        if (lowBarrier && isVisible(lowBarrier) && lowBarrier.value) {
            proposal['barrier2'] = lowBarrier.value;
        }

        return proposal;
    };

    var display = function (details, contractType, spotElement) {
        var proposal = details['proposal'],
            params = details['echo_req'],
            type = params['contract_type'] || typeDisplayIdMapping[proposal['id']],
            h4 = document.createElement('h4'),
            row = document.createElement('div'),
            description = row.cloneNode(),
            fragment = document.createDocumentFragment();

        if (params && Object.getOwnPropertyNames(params).length > 0) {
            typeDisplayIdMapping[proposal['id']] = type;
        }

        var position = contractTypeDisplayMapping(type),
            display = contractType[type],
            container = document.getElementById('price_container_' + position),
            description_container = document.getElementById('description_container_' + position),
            purchase = document.getElementById('contract_purchase_' + position);

        while (description_container && description_container.firstChild) {
            description_container.removeChild(description_container.firstChild);
        }

        h4.setAttribute('class', 'contract_heading ' + display);
        h4.setAttribute('id', 'contract_heading_' + position);

        description.setAttribute('class', 'contract_description big-col');
        description.setAttribute('id', 'contract_description_' + position);
        row.setAttribute('class', 'row');

        var content = document.createTextNode(display);
        h4.appendChild(content);
        fragment.appendChild(h4);

        if (proposal['error']) {
            purchase.style.display = 'none';
            content = document.createTextNode(proposal['error']);
            description.appendChild(content);
            row.appendChild(description);
            fragment.appendChild(row);
        } else {
            var amount = document.createElement('div'),
                priceId = document.createElement('input'),
                currency = document.getElementById('currency');

            amount.setAttribute('class', 'contract_amount col');
            amount.setAttribute('id', 'contract_amount_' + position);

            content = document.createTextNode(currency.value + ' ' + proposal['ask_price']);
            amount.appendChild(content);

            content = document.createTextNode(proposal['longcode']);
            description.appendChild(content);

            // create unique id object that is send in response
            priceId.setAttribute('name', 'contract_price_id');
            priceId.setAttribute('class', 'contract_price_id');
            priceId.setAttribute('type', 'hidden');
            priceId.setAttribute('id', proposal['id']);

            row.appendChild(amount);
            row.appendChild(description);
            row.appendChild(priceId);

            fragment.appendChild(row);

            spotElement.textContent = proposal['spot'];
        }
        description_container.appendChild(fragment);
        container.insertBefore(description_container, purchase);
    };

    var clearMapping = function () {
        typeDisplayIdMapping = {};
    };

    return {
        proposal: createProposal,
        display: display,
        clearMapping: clearMapping,
        idDisplayMapping: function () { return typeDisplayIdMapping; }
    };

})();
