extends Node2D
## In-game level editor. Lets the player drag-and-drop objects on a grid,
## then test the level in-place. Saves to a Dictionary that matches
## LevelDataSchema.
##
## This is a minimal-but-usable editor. The richer one in the web app
## (apps/web/src/app/editor) handles publishing — Godot focuses on test+play.

class_name EditorRuntime

const GRID := 30.0

@export var current_tool: String = "block"

var level_data: Dictionary = {
    "schemaVersion": 1,
    "name": "Untitled",
    "creatorId": "",
    "difficulty": "normal",
    "settings": {
        "speed": 1, "background": "dark-city", "groundColor": "#1a1a2e",
        "songOffsetMs": 0, "bpm": 120, "gameMode": "cube",
    },
    "objects": [],
}

func place_at(world_pos: Vector2) -> void:
    var snapped := Vector2(snappedf(world_pos.x, GRID), snappedf(world_pos.y, GRID))
    level_data["objects"].append({
        "type": current_tool,
        "x": snapped.x,
        "y": snapped.y,
        "rotation": 0,
        "scale": 1,
    })

func remove_at(world_pos: Vector2) -> void:
    var objs: Array = level_data["objects"]
    for i in range(objs.size() - 1, -1, -1):
        var o = objs[i]
        if abs(float(o["x"]) - world_pos.x) <= GRID and abs(float(o["y"]) - world_pos.y) <= GRID:
            objs.remove_at(i)
            return

func export_json() -> String:
    return JSON.stringify(level_data, "\t")

func publish() -> Variant:
    return await ApiClient.publish_level(level_data)
