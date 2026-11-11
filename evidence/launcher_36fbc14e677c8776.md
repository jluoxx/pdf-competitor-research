# All Document - File Viewer：Launcher 在线参数深挖

> 续查更新：已闭环自然／非自然来源与org广告分组，并于15:28刷新接口；见[买量自然量与广告风险专项](买量自然量与广告风险专项.md)。下文原值仍保留14:35取样时点。

包名：`com.alldocument.fileviewer.tools`；样本 versionName=1.0 / versionCode=11。接口取样：2026-11-11T14:35:39+08:00（北京时间）。

## 先看结论

这款包内同时有文档工具与 Lawnchair 桌面能力。在线配置可以控制桌面入口组件、部分图标及设置入口、设桌引导、广告场景频控、广告位路由、新闻轮询与评价机制。**本次实际请求到业务配置44项、场景频控26项、广告路由29条**，不是仅从APK字符串推测在线能力。

最关键的机制是两套配置合并：业务配置管“何时允许”，广告配置管“这个位置使用哪个池/平台”。所以“接口里有广告位”不代表它可通过频控，更不代表已展示。

**取样边界：**在本机PC使用APK还原的普通配置请求、渠道google、全零合成Android ID、合成本次安装时间。未连接手机、未读取真实Android ID、未安装或切换默认桌面。接口实值是这个请求条件下的返回，可能因安装时间、标识、渠道、来源、IP、AB实验、服务端时间而变化；不是用户手机运行快照。没有请求广告素材、点击广告、购买或上传业务事件。

## 1. 样本与证据链

- 应用APK标签：`#All Document - File Viewer`；启动页：`com.niovwa.bvikj.nkgvncxjiovdizmvxodqdote`。
- base SHA-256：`7eda322286a3ecdaf7ab054db02b4e2d66a05c5fb5d329e2f9d08d0d7178376d`。
- 共25个APK文件，按原manifest逐一重新计算哈希并全部一致。原研究副本base哈希也与本次目标一致，才复用业务字节码及历史引用记录。
- REA实际读取业务方法与调用引用；Craft实际解析包、类、方法字节码与qf9引用；关键键名用XOR解码与g28常量赋值核对。
- 本次部分新增REA方法超时、构造器查询失败，完整错误保留在`tool_audit.json`；对应分支补用同哈希DEX字节码。未把失败记录算作有效分析。
- [样本核对](sample_verification.json) · [工具记录](tool_audit.json) · [完整44项参数表](在线参数44项.csv) · [原始业务响应](network_probe/wb_probe.json) · [原始广告响应](network_probe/ad_probe.json)。

## 2. 远端从哪里来，如何落地

### 2.1 业务配置接口

`POST https://s.sognhubgames.com/flop`，JSON body。真实请求键已经混淆：

|线上请求键|本次值/来源|代码位置|
|---|---|---|
|sbrt|44000000，项目标识|h28.a|
|gslzx|44000，包内业务标识|h28.l|
|aerg|google，渠道|h28.d|
|swzdz|2，此类配置请求类型|iCPK.g|
|sjbn|安装时间毫秒；本次合成|u1a.a读取firstInstallTime|
|mxqu|Android ID；本次使用0000000000000000|u1a.b|
|ldng|缓存配置版本；本次空|iCPK.i|

响应：HTTP 200，JSON code=200；业务Map在`data.ecceno`，本次44项。请求版本与软件versionName是不同概念，不应把sjbn误认成versionCode。

`iCPK.j(force)`优先读`ol:map:config:cache:key`，需要刷新时调用业务接口；返回解析后，`iCPK.h协程`保存版本与原始字符串，emit状态，再调用`ns1.i`合成全局配置。

`ns1.i`将业务Map合并，若广告配置非空，则挂入`tnhvns`（代码调试语义ol_ad_pos_v2），保存到`ol:cf:config:cache:key`，emit并发送`ol_cf_config_update_action`本地广播。业务基础Map为空时不直接发出仅广告Map。

证据：[远端请求](m015_com.wg.iv.iCPK$g.invokeSuspend.java.txt)、[写缓存与通知](m016_com.wg.iv.iCPK$h.invokeSuspend.java.txt)、[配置合并](m034_ns1.i.java.txt)、[请求实现](m057_ns1.f.java.txt)。

### 2.2 广告配置接口

`POST https://tools.sognhubgames.com/flop`。同样使用项目、渠道、安装时间和Android ID，但渠道键为`ctbakr`，`swzdz=3`，`sxekz=4`，`ijjr`携带Base64编码的已有广告配置；本次发送空JSON的Base64，未模拟真实设备缓存。

响应HTTP 200 / code=200，`data`是Base64 JSON。解码结果为：

- 29条spaces记录：27条`space_type=ref`位置 + 2条实际池配置。
- plaque 21条 = 20条引用位置 + 1条池；msg 8条 = 7条引用位置 + 1条池。不能把29条全部称为独立用户点位。
- 本次`platforms`仅返回`topon`。这是此次下发的路由平台，不代表所有地区、所有设备始终只有这一家，也不能还原TopOn后台内部瀑布流。
- 多个plaque位置引用同一个`23000014-1`池；多个msg位置引用同一个`44000007-1`池。最终分别指向TopOn placement。
- `ab_test.ab_match=false`是本次响应字段，仅说明该响应的AB标记。

证据：[解码广告配置](online_ad_config_decoded.json)、[29条路由](广告路由29项.csv)、[请求方法](m019_com.r.sbg.LhLE$c.invokeSuspend.java.txt)。

### 2.3 Firebase负责触发刷新，并非拿到整张配置直接消费

`iCPK.q→r`注册更新监听并调用拉取激活；监听更新后先激活，成功时执行`h()`。

`h()`读取键：`v + MD5(44000000).前12位` = **`v47fc6bf32ef7`**。该值与`ol:wb:fb:update:tag`比较，非空且变化才存新标记，再以0～59秒随机延迟安排业务配置与广告配置Worker。它更像配置更新通知标记，不能把Firebase字符串等同整套业务参数。

另外读取`return_rate`，优先本地`track:return:rate`，未设置时才取远端；解析失败回退-1。本次未向Firebase配置接口注册安装或请求配置，实际return_rate未知。

本地周期兜底：业务配置8小时，广告配置3小时；远端可用athnu / zviqba覆盖秒值，vkna / oqvze控制循环（默认1）。本次业务响应未含这些键，所以只能列代码默认。失败退避包括10秒、30秒、2分钟、10分钟、30分钟，实际调度还受Android WorkManager影响。

证据：[Firebase触发](m010_com.wg.iv.iCPK.h.java.txt)、[激活监听](m073_com.wg.iv.iCPK$d.a.java.txt)、[MD5截取字节码](md5_slice.craft.json)、[业务Worker](com.m.c.cisB.bytecode.decoded.txt)、[广告Worker](com.i.c.loxO.bytecode.decoded.txt)。

## 3. Launcher最值得看的参数

**代码中的可读名称主要用作调试说明，实际从Map取的是混淆键。** 例如hide_icon对应eeffer，直接在线下发hide_icon未必有作用。

|可读名称/用途|线上键|包内默认|本次返回|已追到的行为|
|---|---|---|---|---|
|launcher_set|ulyw|1|1|启动分支以==1判断；配置观察器以!=0切换两个入口组件|
|hide_icon|eeffer|0|1|受本地状态和图标判断共同约束的隐藏条件|
|hide_settings|fzgtb|1|1|非本地保护状态下，设置入口隐藏判断为true|
|homepermis_guid3|xuupw|调用方默认1|1|设桌提醒/引导读取；枚举含义未完整还原|
|reset_home|vukg|1|0|getter返回false，但尚未发现业务调用，不宣布行为生效|
|reset_preferred_launcher_time|wfazza|0秒|3600|重置首选桌面相关接收器的最短间隔1小时，另有多重条件|
|red_point_show|wcbud|20|20|红点处理/召回阈值，已定位分钟换算|
|msgautorefresh|deomopvxr|30|30|多个原生广告容器刷新getter；不等于全场景曝光间隔|
|icon_outlink1|wcbr|包内Yandex链接|Yandex游戏链接|功能入口外链可远程替换|

`launcher_set`的两个消费者判断不完全一样：值=2时，启动分支`==1`为false，而组件切换`!=0`仍为true；不应把所有非零数当成与1相同的配置。此处是静态分支差异，未在设备上执行值=2的实验。

`eeffer=1`、`fzgtb=1`也不等于“立即隐藏所有桌面图标和设置”。本地保护状态、item规则和页面刷新时机仍参与最终行为。

本次未返回但代码存在的参数：default_home_check_cd→ajiul，默认0；home_guide_dismiss_timeout→jtju，默认5秒（9999不启动倒计时）；screen_adtime→gpphk，默认0秒（9999在该路径禁用）；coupons_link→kioe，默认Slickdeals；feedback_email→mevatm，默认空；news_icon→ylhp，默认1。不能把其他未知键中出现的9999都解释成禁用。

证据：[桌面总开关](m063_ux.j.java.txt)、[组件切换观察](m062_yr1.c.java.txt)、[组件API](znb.bytecode.decoded.txt)、[图标判断](m064_px5.j.java.txt)、[设置判断](m066_px5.l.java.txt)、[接收器](m068_hd7.onReceive.java.txt)。

## 4. 广告控制：全局、类型、场景、路由分层

`wvkns`下发`e30=`，Base64解码为`{}`，用于全局及按广告类型的计数/冷却模型；`hvxlh`则是26个scene的独立配置。空全局模型不能抵消场景规则。

### 字段含义（已交叉核对解析器和判定器）

|字段|含义|关键数值逻辑|
|---|---|---|
|stm|场景累计展示上限|>0才检查；达到时拦截|
|sdm|场景每日展示上限|>0才检查；0不是每天0次|
|ctm|场景累计点击上限|>0才检查|
|cdm|场景每日点击上限|>0才检查|
|cd|场景冷却秒数|>0检查间隔；0无此层冷却；<0直接scene disabled|
|dly|内部newer状态的限制/首段延迟|<0且newer状态成立时拦截；正值另有首次时间门槛|
|org_dly|内部org状态的限制/首段延迟|<0且org状态成立时拦截；正值另有时间门槛|

续查已闭环：newer来自首启日期状态，org来自风险结果回调，涵盖自然来源、风险条件未通过及未知等情况，不能直接等同自然用户。详见买量自然量与广告风险专项；仍无真实设备分组结果。

### 26场景的本次完整频控

全部stm/sdm/ctm/cdm均为0，只列时间与状态字段。场景说明按已追代码记录；混淆路径不能确认业务页面时保留缺口。

|场景ID|触发线索|cd秒|dly|org_dly|解释|
|---|---|---:|---:|---:|---|
|21000002|负一屏路径/开屏预载共用场景|120|0|-1|仍需检查状态及路由|
|23000015|侧边入口及新闻模块切换相关|120|0|-1|仍需检查状态及路由|
|23000016|新闻列表/新闻进入|120|0|-1|仍需检查状态及路由|
|23000017|壁纸应用完成及新闻模块相关|120|0|-1|仍需检查状态及路由|
|23000018|未定位明确触发|-1|-1|-1|场景直接禁用|
|23000020|侧边新闻入口等|120|0|-1|仍需检查状态及路由|
|23000022|新闻点击：scroll_headline分支|120|0|-1|仍需检查状态及路由|
|23000023|hle.k前置广告分支|-1|-1|-1|场景直接禁用|
|23000024|未定位明确触发|-1|-1|0|场景直接禁用|
|23000026|多种文档/工具流程广告调用|60|0|-1|仍需检查状态及路由|
|23000031|OnboardVM相关，触发未闭环|-1|-1|-1|场景直接禁用|
|23000035|首开/引导/启动相关|0|0|0|仍需检查状态及路由|
|23000036|首开/引导/启动相关|0|0|0|仍需检查状态及路由|
|23000045|All apps图标点击|60|1|-1|仍需检查状态及路由|
|23000046|第三方应用相关桌面场景|300|0|-1|仍需检查状态及路由|
|31000005|hle.k回退/桌面功能入口相关|60|0|-1|仍需检查状态及路由|
|31000006|侧边功能/壁纸等回退相关|60|0|0|仍需检查状态及路由|
|44000007|多处信息流原生容器|0|0|-1|仍需检查状态及路由|
|44000008|原生容器|0|0|-1|仍需检查状态及路由|
|44000010|桌面/新闻原生广告容器|0|0|-1|仍需检查状态及路由|
|44000011|新闻/内容页原生容器|0|0|-1|仍需检查状态及路由|
|44000012|新闻嵌入广告容器|0|0|-1|仍需检查状态及路由|
|44000013|未定位明确触发|0|0|-1|仍需检查状态及路由|
|44000022|场景列表中声明；未见本次广告路由|0|0|0|仍需检查状态及路由|
|44000024|hle相关回退原生位置|-1|-1|-1|场景直接禁用|
|44000036|多处原生容器；未见本次广告路由|180|-1|-1|仍需检查状态及路由|

重要交叉点：

- `23000045`确实关联All apps图标点击；本次冷却60秒、dly=1，仍需实际状态、缓存和广告回调满足。
- `23000046`有第三方应用相关桌面调用；本次冷却300秒。
- `23000035/36`在启动/引导路径出现，cd/dly/org_dly均0。这只说明这层不拦，不能据此说首开必出广告。
- `23000018/23/24/31`及`44000024`的cd=-1，能被场景判定器直接拦截，即使广告路由里有记录也一样。
- `44000022/44000036`有场景控制条目，但本次广告响应未返回对应路由；反过来`23000014/19/25`有路由，却没有独立scene条目。需要按不同配置层核对，不能简单用一张清单的数量当实际点位数。

证据：[26场景CSV](广告场景频控26项.csv)、[调用入口索引](scene_callers.json)、[基本限制判定](atb.bytecode.decoded.txt)、[时间判定](zsb.bytecode.decoded.txt)、[场景更新到控制器](df1$a$a.bytecode.decoded.txt)。

## 5. 新闻、评价、限制条件与未闭环项

### 新闻

ubrmi=20按**分钟**转毫秒控制新闻自动处理轮询；sylo=120与htgvo=10按**秒**转毫秒写时间阈值；deqc=0、rucz=0写整型策略。不能因为两个字段是0就断言整个新闻模块关闭。默认轮询字段原初始化45分钟，本次更新为20分钟；最终召回仍叠加z97的任务状态和时间判断。

### 评价

kcpor解码：

```json
{"enable":1,"max_show_count":1,"interval":1440,"ratio":50}
```

配置观察器au4将其写入w7a。已追到开关、抽样阈值、计数限制和评价请求/launch方法；ratio=50用于本地抽样门槛，不代表实际一半用户必出评价。interval字段已解析，但最终时间拦截未闭环，**不将1440直接宣称为每天一次**。

### 限制条件（已还原编码）

liefm不是普通Base64文本，解码字节后取首8+尾8为循环XOR键，中段解码得到：

```json
{"limit_condition":"1,2,3","limit_package":"org.wireshark.android"}
```

b87.i先剔除旧的限制字段，再从该编码字段合并白名单中的limit_condition、limit_package、limit_timechange、limit_timechange_total、time_modif_range、gkid。

条件编号已定位：1=ADB状态读取（adb_enabled），2=自动时间/系统时间变化监听，3=归因来源匹配，4=指定应用安装检查（PackageManager、包安装/卸载广播）。**本次limit_condition包含1/2/3，没有4，因此不能把limit_package列表存在写成Wireshark安装检查当前已启用。** 是否触发限制、是否压制广告还需设备状态/归因结果；未执行环境规避实验。

证据：[原编码与解码值](online_limit_condition_decoded.json)、[编码还原算法](qq8.bytecode.decoded.txt)、[条件合并](b87.bytecode.decoded.txt)、[条件启用判定](wza$a.bytecode.decoded.txt)、[安装检查能力](fq6.bytecode.decoded.txt)。

### 推送与归因边界

ajce解码得到推送样式/时段结构，enable为字符串0，另含timing/unlock/screenlitup等。**本轮仅定位该键的常量，未找到完整消费者，不能确认整个推送系统关闭。** 原值保留于online_nested_decoded.json。

ndlgnpeu是type=firebase、app_token=0的JSON字符串，存在第三方初始化解析链；配置声明与真实初始化/事件上传仍分开。

### 尚不能确认的参数

下面不是遗漏，已完整保存：响应中存在但本样本导出业务代码未定位明确消费链的字段，或服务端保留字段。尤其951、40、时间戳形态值、9999不能凭外观猜含义。

|线上键|本次返回值|
|---|---|
|snabfd|`0`|
|vgrtty|`951`|
|nfxv|`0`|
|lkav|`1`|
|zsdoxp|`0`|
|wsbm|`amylbz5`|
|mrnk|`1`|
|xdhg|`0`|
|yduv|`5`|
|zlvhfqsaz|`90,80,80,70,70,50,50,0`|
|sjnip|`co4ulh9gs`|
|nskma|`9999`|
|dghikc|`1`|
|zaaqyo|`0`|
|kurt|`gfv8l6ay67o`|
|fwechd|`1794378942903`|
|namq|`6hy2`|
|vico|`b0ngbq`|
|qxdbsd|`9999`|
|yrrm|`40`|
|zwju|`pl`|
|swcf|`k83`|
|ojddy|`inxvicvi`|
|ylzs|`0`|

## 6. 覆盖状态与下一步验证点

|主题|已完成|边界|
|---|---|---|
|APK身份/完整性|已验证哈希，25个APK文件（含base）；包内版本及入口核对|不是商店最新版确认|
|业务接口与广告接口|本次PC实际返回均HTTP200，原始响应留存|合成标识，未验证真实设备人群|
|缓存、合并、激活触发|代码与关键字节码已追|未测进程重启、系统调度和离线恢复|
|Launcher控制|关键getter、组件切换、图标/设置/接收器分支已追|未切换默认桌面、未做UI触达验证|
|广告频控/路由|26场景与29路由完整取样，规则解析及判定已追|无广告曝光/收益/奖励实际观察|
|新闻与评价|解析、写入及部分下游已追|评价interval与部分枚举未闭环|
|限制条件|编码已解、条件1/2/3/4及启用集合已区分|没有规避限制或改变手机环境|
|其他返回字段|44项全部登记|未解析键明确列出，未臆造含义|

若后续进入真机，应先记录该机实际取到的两套配置及激活时间，再联动默认桌面状态、归因状态、图标/设置截图、场景拦截原因和广告impression回调。该步骤本轮未执行。

商店链接由用户提供：[Google Play](https://play.google.com/store/apps/details?id=com.alldocument.fileviewer.tools)。本次网页读取返回Unsupported content type，产品身份和实现结论以本地APK及接口证据为准。
