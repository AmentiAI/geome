extends Node
## Talks to the geome web backend. Autoloaded as `ApiClient`.
##
## All endpoints assume the web app is reachable at GameState.web_origin.
## On native builds you must include credentials some other way (a token issued
## by /api/realtime/token-style endpoint). For HTML5 export running inside the
## Next.js site, cookies will be sent automatically because of the same origin.

signal request_failed(endpoint: String, code: int, body: String)

const HEADERS_JSON := ["Content-Type: application/json", "Accept: application/json"]

func _origin() -> String:
    return GameState.web_origin

func fetch_level(level_id: String) -> Dictionary:
    var http := HTTPRequest.new()
    add_child(http)
    var url := "%s/api/levels/%s" % [_origin(), level_id]
    http.request(url, [], HTTPClient.METHOD_GET)
    var result: Array = await http.request_completed
    http.queue_free()
    var code: int = result[1]
    var body: PackedByteArray = result[3]
    if code < 200 or code >= 300:
        request_failed.emit(url, code, body.get_string_from_utf8())
        return {}
    return JSON.parse_string(body.get_string_from_utf8())

func submit_score(level_id: String, percent: float, attempts: int, duration_ms: int, coins: int, practice: bool) -> bool:
    var http := HTTPRequest.new()
    add_child(http)
    var url := "%s/api/scores" % _origin()
    var payload := {
        "levelId": level_id,
        "percent": percent,
        "attempts": attempts,
        "durationMs": duration_ms,
        "coinsCollected": coins,
        "practice": practice,
    }
    http.request(url, HEADERS_JSON, HTTPClient.METHOD_POST, JSON.stringify(payload))
    var result: Array = await http.request_completed
    http.queue_free()
    var code: int = result[1]
    return code >= 200 and code < 300

func publish_level(level_data: Dictionary) -> Variant:
    var http := HTTPRequest.new()
    add_child(http)
    var url := "%s/api/levels" % _origin()
    var payload := {"data": level_data}
    http.request(url, HEADERS_JSON, HTTPClient.METHOD_POST, JSON.stringify(payload))
    var result: Array = await http.request_completed
    http.queue_free()
    var code: int = result[1]
    var body: PackedByteArray = result[3]
    if code < 200 or code >= 300:
        request_failed.emit(url, code, body.get_string_from_utf8())
        return null
    return JSON.parse_string(body.get_string_from_utf8())
