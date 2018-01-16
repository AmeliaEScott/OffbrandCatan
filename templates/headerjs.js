// This global variable is used to draw the game board.
// It is in this HTML file because it needs to be generated dynamically using templates.
// This is because, if this entire app is hosted at something like /game, all of these static URLs will change.

var resourceUrls = {
    'wheat': "{{ url_for('static', filename='images/hex_wheat.png') }}",
    'clay': "{{ url_for('static', filename='images/hex_clay.png') }}",
    'rocks': "{{ url_for('static', filename='images/hex_rocks.png') }}",
    'sheep': "{{ url_for('static', filename='images/hex_sheep.png') }}",
    'wood': "{{ url_for('static', filename='images/hex_wood.png') }}",
    'desert': "{{ url_for('static', filename='images/hex_desert.png') }}"
};

var resourceCardUrls = {
    'wheat': "{{ url_for('static', filename='images/resource_wheat.png') }}",
    'clay': "{{ url_for('static', filename='images/resource_clay.png') }}",
    'rocks': "{{ url_for('static', filename='images/resource_rocks.png') }}",
    'sheep': "{{ url_for('static', filename='images/resource_sheep.png') }}",
    'wood': "{{ url_for('static', filename='images/resource_wood.png') }}",
    'desert': "{{ url_for('static', filename='images/resource_desert.png') }}"
};

{% if playercolors %}
var playerIcons = {
{% for player, color in playercolors.items() %}
    {{ player }}: {
        'city': '{{ url_for('gameplay.get_icon', icon='city', color=color) }}',
        'settlement': '{{ url_for('gameplay.get_icon', icon='settlement', color=color) }}',
        'road': '{{ url_for('gameplay.get_icon', icon='road', color=color) }}',
    },
{% endfor %}
};
{% endif %}

{% if me %}
var me = {{ me }};
{% endif %}