local key = KEYS[1]
local max_tokens = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local current_time = tonumber(ARGV[3])
local ttl = tonumber(ARGV[4])

local bucket = redis.call("GET", key)

if bucket then
    bucket = cjson.decode(bucket)
else
    bucket = {tokens=max_tokens, last_refill=current_time}
end

local elapsed = current_time - bucket.last_refill
local refill = math.floor(elapsed * refill_rate)

bucket.tokens = math.min(max_tokens, bucket.tokens + refill)
bucket.last_refill = current_time

if bucket.tokens < 1 then
    redis.call("SET", key, cjson.encode(bucket), "EX", math.floor(ttl))
    return 0
end

bucket.tokens = bucket.tokens - 1

redis.call("SET", key, cjson.encode(bucket), "EX", math.floor(ttl))

return 1
