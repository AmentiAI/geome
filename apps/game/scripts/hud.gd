extends CanvasLayer

@onready var attempt_label: Label = $Root/Attempt
@onready var percent_label: Label = $Root/Percent

func _ready() -> void:
    GameState.attempt_started.connect(_refresh)
    GameState.attempt_failed.connect(func(_p: float): _refresh())
    _refresh()

func _process(_delta: float) -> void:
    var player := get_tree().get_first_node_in_group(&"player")
    if player and player.has_method("current_percent"):
        percent_label.text = "%.1f%%" % player.current_percent()

func _refresh() -> void:
    attempt_label.text = "Attempt %d" % GameState.current_attempts
