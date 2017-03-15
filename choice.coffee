# lib.cs.misc - Check the status of code repositories under a root directory.
# Copyright (C) 2016 Dario Giovannetti <dev@dariogiovannetti.net>
#
# This file is part of lib.cs.misc.
#
# lib.cs.misc is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# lib.cs.misc is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with lib.cs.misc.  If not, see <http://www.gnu.org/licenses/>.

$ = require('jquery')


module.exports.Choice = (options, selected, attributes) ->
    select = $('<select>').attr(attributes)
    for opt in options
        option = $('<option>').text(opt).val(opt).appendTo(select)
        if opt == selected
            option.attr('selected', '')
    return select


module.exports.Multichoice = (legend, items, checked, attributes) ->
    fieldset = $('<fieldset>')
        .append($('<legend>').text(legend))
        .attr(attributes)
    for item in items
        input = $('<input>')
            .val(item)
            .attr('type': 'checkbox')
            .attr(attributes)
        if item in checked
            input.attr('checked', '')
        fieldset.append($('<div>').append(item, input))
    return fieldset
