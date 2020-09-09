wrk.method = "POST"
wrk.body = '{"query":"{users(id:1){username}}"}'
wrk.headers["Content-Type"] = "application/json"

-- logfile = io.open("wrk.log", "w");
-- local cnt = 0;

-- response = function(status, header, body)
--      logfile:write("status:" .. status .. "\n");
--      cnt = cnt + 1;
--      logfile:write("status:" .. status .. "\n" .. body .. "\n-------------------------------------------------\n");
-- end

-- done = function(summary, latency, requests)
--      logfile:write("------------- SUMMARY -------------\n")
--      print("Response count: ", cnt)
--      logfile.close();
-- end
