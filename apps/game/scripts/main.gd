extends Node
## Entry-point scene. Picks the level to play based on URL params (HTML5 export)
## or an environment variable, then instances Level.tscn.

const LEVEL_SCENE := preload("res://scenes/Level.tscn")
const TUTORIAL_LEVEL := preload("res://levels/tutorial.json")

func _ready() -> void:
    var level_id := _read_query_param("level")
    if level_id.is_empty():
        _load_local_tutorial()
    elif level_id.begins_with("local:"):
        _load_local(level_id.substr(6))
    else:
        _load_remote(level_id)

func _read_query_param(name: String) -> String:
    if not OS.has_feature("web"):
        return ""
    var location: String = JavaScriptBridge.eval("window.location.search", true)
    if location == null or location.is_empty():
        return ""
    var params := location.trim_prefix("?").split("&")
    for kv in params:
        var parts := kv.split("=")
        if parts.size() == 2 and parts[0] == name:
            return parts[1].uri_decode()
    return ""

func _load_local_tutorial() -> void:
    _load_local("tutorial")

func _load_local(slug: String) -> void:
    var path := "res://levels/%s.json" % slug
    if not FileAccess.file_exists(path):
        push_error("Local level not found: %s" % path)
        return
    var json_text := FileAccess.get_file_as_string(path)
    var data: Dictionary = JSON.parse_string(json_text)
    data["id"] = "local:%s" % slug
    _spawn_level(data)

func _load_remote(level_id: String) -> void:
    var resp: Variant = await ApiClient.fetch_level(level_id)
    if resp == null or not resp is Dictionary or not resp.has("data"):
        push_error("Failed to load level %s" % level_id)
        _load_local_tutorial()
        return
    var data: Dictionary = resp["data"]
    data["id"] = level_id
    _spawn_level(data)

func _spawn_level(data: Dictionary) -> void:
    var level := LEVEL_SCENE.instantiate()
    level.level_data = data
    add_child(level)
