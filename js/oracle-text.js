/**
 * 因地制宜解卦：本卦象 + 事类 + 地气方位
 * 辞为象数参考，非宿命断语。
 */
(function () {
  const BY_EVENT = {
    乾: {
      career: "宜自强进取，然防亢龙：功成须知止，勿恃才傲物。",
      love: "阳刚过盛则情疏。宜以诚载物，勿以势压人。",
      wealth: "大利开创与长线布局；急功近利则有悔。",
      health: "体气盛而燥，宜节劳宁神，防头目肝阳。",
      travel: "利远行见大人；过刚则旅途生口舌。",
      lawsuit: "理直气壮可胜，然宜持正，勿穷追。",
      exam: "利见大人、文书显达；戒骄傲轻敌。",
      decision: "可进。进以正，止于满盈。"
    },
    坤: {
      career: "宜厚德载物、辅成其事，不宜争先为主。",
      love: "顺承则吉。先迷后得，宜后发而安贞。",
      wealth: "利积蓄、地产、合作分成；忌独自冒进。",
      health: "脾胃土气，宜温养；防湿滞、疲惫。",
      travel: "利西南得朋；东北丧朋，远行宜结伴。",
      lawsuit: "宜柔不宜刚，和解、退让中求全。",
      exam: "扎实积累可成；投机取巧则先迷。",
      decision: "宜守、宜辅、宜后动。安贞吉。"
    },
    屯: {
      career: "事业草创，磐桓勿躁。利建侯，先立根基。",
      love: "婚媾有阻，十年乃字之象。宜耐心，勿强求。",
      wealth: "财路未通，屯膏之时。小贞吉，大贞凶。",
      health: "气血初滞，宜疏不宜猛攻。",
      travel: "路难行。君子几不如舍，往吝。",
      lawsuit: "事体胶着，宜寻明主、借力化解。",
      exam: "初试不利，利在积累与择师。",
      decision: "勿用有攸往。先安营，再图进。"
    },
    蒙: {
      career: "学而后仕。初筮告，再三渎则不告——问事宜专。",
      love: "童蒙求我则吉；见金夫不有躬，勿为利诱。",
      wealth: "财识未开，勿轻信人言。包蒙吉。",
      health: "宜调养启蒙之躯，忌猛药。",
      travel: "方向未明，先问道再行。",
      lawsuit: "事理未清，宜请教明人，勿再三翻供。",
      exam: "正是问学之时。一问则告，勿猜题连占。",
      decision: "未明则勿决。先发蒙，后行动。"
    },
    需: {
      career: "等待时机，饮食宴乐以待云雨。急则致寇。",
      love: "需于郊、于沙，感情在酝酿，勿催促。",
      wealth: "财在酒食之外。需于血则险，敬客终吉。",
      health: "宜静养待复，勿强进补。",
      travel: "利涉大川，然须等天时。",
      lawsuit: "暂勿对簿，待有孚光亨。",
      exam: "复习如云上于天，考期未至勿慌。",
      decision: "且需。时未至，动则泥。"
    },
    讼: {
      career: "中吉终凶。宜谋始，不宜缠讼争位。",
      love: "口舌伤情。不克讼则归，退一步海阔。",
      wealth: "争财不利涉大川，宜和解分账。",
      health: "心火上炎，宜息争宁心。",
      travel: "不利远行，途中易生争执。",
      lawsuit: "本卦。有孚窒惕，见大人则中吉，缠讼终凶。",
      exam: "与人争名无益，守旧德则终吉。",
      decision: "能止则止。讼不可长。"
    },
    师: {
      career: "须有丈人统众。出师以律，否则舆尸。",
      love: "众中求偶，宜择正，忌小人搀和。",
      wealth: "团队作战可获，私兵则凶。",
      health: "正气抗邪，须纪律与调理，勿乱投医。",
      travel: "行军之象，宜有向导与纪律。",
      lawsuit: "众怒难犯，宜有长者出面。",
      exam: "按计划复习如师出以律。",
      decision: "可举大事，须得人、得律。"
    },
    比: {
      career: "亲附明主、结盟则吉。后夫凶，宜早附。",
      love: "比之自内贞吉；比之匪人则伤。",
      wealth: "合作比和则财聚，无首则散。",
      health: "宜亲近良医、规律作息。",
      travel: "结伴、投亲则吉。",
      lawsuit: "求同党、求原筮，孤立则凶。",
      exam: "从良师、入佳组则吉。",
      decision: "宜合不宜孤。择所比之人。"
    },
    小畜: {
      career: "力量未足，密云不雨。宜修文德，待时。",
      love: "情意积而未化，夫妻或有反目，宜沟通。",
      wealth: "小有积蓄，未可大用。富以其邻则吉。",
      health: "小恙郁积，宜疏导，勿硬撑。",
      travel: "西郊有云，行程或滞。",
      lawsuit: "小有阻，血去惕出则无咎。",
      exam: "积累未满，再畜文德。",
      decision: "宜畜不宜发。小往可，大往暂缓。"
    },
    履: {
      career: "如履虎尾，谨慎行事则亨。辨上下、守职分。",
      love: "素履往则无咎；狂则咥人。",
      wealth: "履道坦坦则吉，冒险投机易凶。",
      health: "行有度则安，过劳则伤。",
      travel: "可往，然须如履薄冰。",
      lawsuit: "愬愬终吉，硬闯则咥。",
      exam: "按规矩作答，视履考祥则旋元吉。",
      decision: "可往，须敬慎。无礼则凶。"
    },
    泰: {
      career: "小往大来，天地交。宜进取、用人、通财。",
      love: "阴阳交泰，婚配和合。",
      wealth: "财路开通，仍须无平不陂，知止。",
      health: "气机通畅，保养即可。",
      travel: "利有攸往。",
      lawsuit: "可和解、可通达，勿用师于城复之时。",
      exam: "运通，发挥可得。",
      decision: "宜往。泰极将否，成事即收。"
    },
    否: {
      career: "大往小来，不宜求进。俭德辟难。",
      love: "隔阂不通。休否待倾，勿强合。",
      wealth: "收缩守财，勿扩张。",
      health: "气机闭塞，宜疏不宜补猛。",
      travel: "不利有攸往。",
      lawsuit: "宜止讼，大人吉在休否。",
      exam: "暂不宜搏，先打基础。",
      decision: "宜守。先否后喜，待倾否之时。"
    },
    同人: {
      career: "于野则亨，于宗则吝。宜开阔合作。",
      love: "同人于门无咎；过于宗亲则窄。",
      wealth: "合伙于公则利，私党则吝。",
      health: "宜群体运动、阳光之气。",
      travel: "利涉大川，同行则吉。",
      lawsuit: "先号咷后笑，得助则克。",
      exam: "君子贞，利见公考、公开赛。",
      decision: "宜公开、宜联合。勿囿于小圈子。"
    },
    大有: {
      career: "火天光明，遏恶扬善。得位得时。",
      love: "光明磊落则吉，权势压情则伤。",
      wealth: "大车以载，自天佑之。仍须艰则无咎。",
      health: "阳气足，防亢热。",
      travel: "无往不利。",
      lawsuit: "理明则胜，小人弗克。",
      exam: "大有之年，发挥可期。",
      decision: "可大作为。守正，勿满盈。"
    },
    谦: {
      career: "裒多益寡。劳谦君子有终。",
      love: "谦谦则吉，骄则失人。",
      wealth: "不富以其邻，平施则久。",
      health: "宜低调调养。",
      travel: "用涉大川吉。",
      lawsuit: "退让、称物平施则无不利。",
      exam: "不矜不伐，成绩可保。",
      decision: "宜谦不宜亢。有终。"
    },
    豫: {
      career: "可建侯行师，然鸣豫则凶。乐而不淫。",
      love: "由豫大有得；盱豫则悔。",
      wealth: "喜庆中有财，沉迷则败。",
      health: "情志宜畅，过乐伤神。",
      travel: "雷出地奋，可动。",
      lawsuit: "宜速断，勿迟疑。",
      exam: "状态可，戒得意忘形。",
      decision: "可举事。介于石，不终日。"
    },
    随: {
      career: "随时而动，出门交有功。官有渝，贞吉。",
      love: "随则得，系小子失丈夫——择所随之人。",
      wealth: "随市、随势则有求得。",
      health: "向晦入宴息，作息随天时。",
      travel: "宜随向导、随时辰。",
      lawsuit: "有孚在道则无咎。",
      exam: "跟着大纲走，勿旁骛。",
      decision: "宜随正，不宜盲从。"
    },
    蛊: {
      career: "振民育德，干父之蛊。先甲后甲，整治积弊。",
      love: "旧伤须理。干母之蛊不可贞，柔事缓图。",
      wealth: "整顿旧业可亨，裕父则吝。",
      health: "积毒宜清，须疗程。",
      travel: "利涉大川，为治蛊而行。",
      lawsuit: "清理旧案，利。",
      exam: "补缺纠错之时。",
      decision: "宜整顿，不宜因循。"
    },
    临: {
      career: "元亨利贞。亲临现场、教思无穷则吉。八月有凶，防盛极。",
      love: "咸临吉；甘临无攸利。",
      wealth: "近利可得，勿甜言诱惑。",
      health: "宜体检、亲诊。",
      travel: "可至，勿过期淹留。",
      lawsuit: "知临、至临则无咎。",
      exam: "临考发挥，敦临则吉。",
      decision: "可临事。把握窗口，过则有凶。"
    },
    观: {
      career: "盥而不荐，先观察制度与人心，再行动。",
      love: "闚观利女贞；君子童观则吝。",
      wealth: "先观盘再入，勿盲目。",
      health: "观我生，察体质再调。",
      travel: "宜考察、观光，不宜深驻未知之地。",
      lawsuit: "观国之光，借势、借名分。",
      exam: "观摩真题、观己之进退。",
      decision: "先观后动。未荐勿轻举。"
    },
    噬嗑: {
      career: "利用狱。有梗须咬断，明罚勅法。",
      love: "隔阂如腊肉，沟通须用力，过猛伤。",
      wealth: "障碍中有金矢，艰难中得财。",
      health: "口腔、消化、炎症，须清须治。",
      travel: "途有阻，排除后方通。",
      lawsuit: "本象。明罚则亨，灭耳则凶。",
      exam: "啃硬题则通。",
      decision: "有滞则决。当断则断。"
    },
    贲: {
      career: "文饰、包装、礼仪之事吉；折狱则不宜。",
      love: "贲其趾、白贲无咎。重实质，轻虚华。",
      wealth: "小利有所往，文创、外观相关。",
      health: "表面症状，治本勿只化妆。",
      travel: "景色之行则宜。",
      lawsuit: "无敢折狱，调解、文书修饰可。",
      exam: "表达、卷面文采有助。",
      decision: "可妆点，不可当实质。"
    },
    剥: {
      career: "不利有攸往。厚下安宅，保核心。",
      love: "情意剥落，硕果仅存须珍惜。",
      wealth: "流失之象，止损。",
      health: "虚损，由下而上，宜补宜止。",
      travel: "不宜远行。",
      lawsuit: "处于下风，守即可。",
      exam: "不宜冒险超纲。",
      decision: "宜止剥。勿再耗。"
    },
    复: {
      career: "反复其道，七日来复。错可改，利有攸往。",
      love: "不远复则元吉；迷复则凶。",
      wealth: "转机将至，勿用师冒进。",
      health: "来复之机，闭关调息。",
      travel: "可再出发，宜有节。",
      lawsuit: "回头是岸。",
      exam: "复盘则吉，迷复则败。",
      decision: "宜复正道。过而能改。"
    },
    无妄: {
      career: "其匪正有眚。无妄则往吉；妄动则灾。",
      love: "勿药有喜，顺其自然。",
      wealth: "不耕获则无妄之财，不可恃。",
      health: "无妄之疾，勿乱服药。",
      travel: "正则利，不正不利有攸往。",
      lawsuit: "无故之灾，守正则免。",
      exam: "诚实作答则吉。",
      decision: "无妄则进。不正则止。"
    },
    大畜: {
      career: "不家食吉。蓄德蓄才，利涉大川。",
      love: "良马逐，可成家，仍须艰贞。",
      wealth: "大蓄将发，何天之衢。",
      health: "蓄精养锐。",
      travel: "利涉，然有厉则已。",
      lawsuit: "畜而后发，勿急。",
      exam: "多识前言往行，畜学则亨。",
      decision: "宜畜、宜学、然后往。"
    },
    颐: {
      career: "自求口实。慎言语、节饮食，勿观人朵颐。",
      love: "养情以正，颠颐则凶。",
      wealth: "靠己力，求人则凶。",
      health: "饮食言语为本。口腹之欲须节。",
      travel: "为口实而行可，闲游则吝。",
      lawsuit: "慎言。",
      exam: "自求真知，勿抄袭。",
      decision: "问：能否自养？能则行。"
    },
    大过: {
      career: "栋桡。非常之举，独立不惧，过则凶。",
      love: "老少配之象，非常情，无咎无誉或凶。",
      wealth: "杠杆过大则灭顶。",
      health: "负荷过重，防猝。",
      travel: "过涉灭顶，凶。",
      lawsuit: "非常手段须慎。",
      exam: "超常发挥或崩，宜稳。",
      decision: "可非常一搏，须知灭顶之戒。"
    },
    坎: {
      career: "习坎。有孚维心亨，行有尚。险中求小得。",
      love: "陷于情，入窞则凶。求小得。",
      wealth: "险中有财，不可贪大。",
      health: "肾水、忧郁、险症，须常德行。",
      travel: "水途有险。",
      lawsuit: "坎坎，勿用，求脱。",
      exam: "难关，心亨则过。",
      decision: "可小试，不可深陷。"
    },
    离: {
      career: "文明附丽。继明照四方，利文书、设计、公开。",
      love: "黄离元吉。日昃则嗟，及时珍惜。",
      wealth: "明则理财清，突如则焚。",
      health: "心目、炎症，过明则伤。",
      travel: "向明之地则利。",
      lawsuit: "明察则吉。",
      exam: "离主文书，本卦大利。",
      decision: "宜明不宜暗。附丽于正。"
    },
    咸: {
      career: "感应、人脉、合作。虚受人则亨。",
      love: "本卦。取女吉。憧憧往来，宜正宜贞。",
      wealth: "因感生财，勿跟着感觉走极端。",
      health: "筋脉感应，宜疏。",
      travel: "因感而动可。",
      lawsuit: "以情感化，勿咸其辅颊舌而乱。",
      exam: "心有灵犀则发挥。",
      decision: "心感则可行。不正则止。"
    },
    恒: {
      career: "立不易方。久于其道则利有攸往。",
      love: "妇人吉夫子凶于恒其德——角色不同，宜各恒其分。",
      wealth: "长期持有吉，频繁操作吝。",
      health: "慢性调理，恒其功。",
      travel: "常来常往则可。",
      lawsuit: "不恒其德则羞。",
      exam: "持续复习则吉。",
      decision: "宜久、宜常。勿浚恒。"
    },
    遁: {
      career: "亨，小利贞。远小人，嘉遁、肥遁则吉。",
      love: "宜暂时抽离，系遁有疾。",
      wealth: "收手、避险。",
      health: "宜退养。",
      travel: "宜离开是非之地。",
      lawsuit: "宜撤、宜和。",
      exam: "不强撑超纲。",
      decision: "宜退。退是为了存身。"
    },
    大壮: {
      career: "利贞。非礼弗履。用壮则藩决，用罔则厉。",
      love: "气盛，须礼。羝羊触藩则困。",
      wealth: "壮可进取，过则折。",
      health: "筋骨气盛，防碰撞。",
      travel: "可征，艰则吉。",
      lawsuit: "壮于趾征凶。",
      exam: "实力足够，戒莽。",
      decision: "可进，须礼与贞。"
    },
    晋: {
      career: "明出地上。晋升、露面、三接之象。",
      love: "愁如亦可贞吉，受介福于长辈。",
      wealth: "进财之象，失得勿恤则往吉。",
      health: "向愈、向明。",
      travel: "宜往向阳、向上之处。",
      lawsuit: "众允悔亡。",
      exam: "晋如，发挥可见。",
      decision: "宜进、宜显。勿如鼫鼠。"
    },
    明夷: {
      career: "利艰贞。用晦而明，潜伏待机。",
      love: "情伤不明，宜守箕子之贞。",
      wealth: "暗耗，艰贞。",
      health: "明入地中，须查隐疾。",
      travel: "君子于行，三日不食之苦旅。",
      lawsuit: "处于暗时，勿露锋。",
      exam: "不利张扬，踏实。",
      decision: "宜晦、宜忍。不利彰显。"
    },
    家人: {
      career: "言有物行有恒。家业、团队伦理为先。",
      love: "利女贞。闲有家，在中馈。",
      wealth: "富家大吉，先齐家。",
      health: "家庭护理、作息。",
      travel: "宜归家，或为家而行。",
      lawsuit: "家事宜内了。",
      exam: "有恒则吉。",
      decision: "先齐家、正内，再向外。"
    },
    睽: {
      career: "小事吉。同而异，求同存异。",
      love: "睽孤。先张弧后说弧，误会可解，往遇雨则吉。",
      wealth: "小生意、差异化则吉，大合同难。",
      health: "上下火泽不交，调节。",
      travel: "路径怪异，终可遇主。",
      lawsuit: "先对立后遇元夫。",
      exam: "思路独特可，勿完全拧。",
      decision: "可做小事。大事须先解睽。"
    },
    蹇: {
      career: "利西南不利东北。反身修德，往蹇来誉。",
      love: "王臣蹇蹇，为公不为私则情可全。",
      wealth: "往则难，来则有。",
      health: "阻滞，宜止宜养。",
      travel: "不利东北行，西南较顺。",
      lawsuit: "大蹇朋来，求援。",
      exam: "难关，修德再考。",
      decision: "宜来不宜往。先修己。"
    },
    解: {
      career: "雷雨作。赦过宥罪，夙吉。",
      love: "解而拇，误会可消，朋至。",
      wealth: "困局将解，田获三狐。",
      health: "病将解，仍须清。",
      travel: "利西南，来复吉。",
      lawsuit: "可解、可赦。",
      exam: "难题可解。",
      decision: "宜解不宜结。有所往则夙。"
    },
    损: {
      career: "惩忿窒欲。损下益上，酌损之。",
      love: "三人行损一人。专一则得其友。",
      wealth: "二簋可用享。减支出、让利可成。",
      health: "减欲、减负担。",
      travel: "减行装则利。",
      lawsuit: "让一步，遄有喜。",
      exam: "减负聚焦。",
      decision: "宜损己、宜简。损中有益。"
    },
    益: {
      career: "利有攸往、利涉大川。见善则迁。",
      love: "有孚惠心，勿问元吉。",
      wealth: "益之，十朋之龟。可大作。",
      health: "补益得法。",
      travel: "利涉。",
      lawsuit: "告公从，得支持。",
      exam: "学有进益。",
      decision: "宜往、宜作。立心勿恒则凶。"
    },
    夬: {
      career: "扬于王庭。决去小人，不利即戎，利有攸往。",
      love: "决裂之象，须公开、须有度。",
      wealth: "果断止损或切割。",
      health: "炎症宜决，不可拖。",
      travel: "可往，勿用兵。",
      lawsuit: "可诉于公，勿私下械斗。",
      exam: "果断下笔。",
      decision: "宜决。中行无咎，无号终凶。"
    },
    姤: {
      career: "女壮勿用取。不期而遇，宜慎始。",
      love: "相遇之卦。女壮则勿取，包有鱼不利宾。",
      wealth: "意外之财或意外之坑，慎。",
      health: "外邪初感。",
      travel: "途中遇人遇事，慎交。",
      lawsuit: "突发牵连。",
      exam: "冷门题，勿慌。",
      decision: "遇则可观，深交须慎。"
    },
    萃: {
      career: "王假有庙。聚会、集资、团队则亨。",
      love: "萃有位。聚则吉，乱萃则号笑不定。",
      wealth: "用大牲吉，集中投入。",
      health: "气血当聚，防散。",
      travel: "宜赴会、赴庙、赴团。",
      lawsuit: "聚众须戒不虞。",
      exam: "集体备考吉。",
      decision: "宜聚、宜见大人。"
    },
    升: {
      career: "地中生木。积小高大，南征吉。",
      love: "渐进升温。",
      wealth: "积小成多。",
      health: "渐复。",
      travel: "宜南向。",
      lawsuit: "逐步升级须有据。",
      exam: "循序则升阶。",
      decision: "宜渐进。勿冥升不息而无度。"
    },
    困: {
      career: "致命遂志。有言不信，以行动证。",
      love: "困于石、不见妻，沟通失效。",
      wealth: "困于酒食或金车，财滞。",
      health: "困顿，须徐有说。",
      travel: "不宜，入幽谷。",
      lawsuit: "有言不信，少说多做。",
      exam: "状态困，祭祀式专注可解。",
      decision: "困中守志。动悔有悔，征或吉于后。"
    },
    井: {
      career: "改邑不改井。专业深耕，往来井井。",
      love: "旧井无禽则须浚，寒泉可食则养。",
      wealth: "细水长流，羸瓶则凶。",
      health: "水液代谢、调养如井。",
      travel: "不必改井，安于本源。",
      lawsuit: "井甃无咎，修缮规则。",
      exam: "深挖一口井。",
      decision: "宜守专业、宜养人。勿改其本。"
    },
    革: {
      career: "巳日乃孚。变革须信，大人虎变。",
      love: "可重新开始，征凶居贞吉于过革。",
      wealth: "改命则吉，有孚。",
      health: "疗程转换。",
      travel: "改道、改期。",
      lawsuit: "革言三就。",
      exam: "改变方法则亨。",
      decision: "可革。信而后革，未占有孚则大人。"
    },
    鼎: {
      career: "正位凝命。新器新命，元吉亨。",
      love: "得妾以其子之类的新结构，须正。",
      wealth: "鼎有实则吉，折足覆餗则凶。",
      health: "饮食器、代谢更新。",
      travel: "为就任、为新职而行。",
      lawsuit: "正名分。",
      exam: "新阶段、新试卷，正位。",
      decision: "宜立新、宜正位。足不稳则覆。"
    },
    震: {
      career: "震惊百里而不丧匕鬯。惧以修省。",
      love: "变动惊吓，后笑言哑哑则吉。",
      wealth: "震荡市，勿逐七日或得。",
      health: "肝胆、惊悸。",
      travel: "雷雨、突发，可行无眚若镇。",
      lawsuit: "突发之讼，镇则无咎。",
      exam: "紧张如震，定则吉。",
      decision: "变不可怕。惧而能定则亨。"
    },
    艮: {
      career: "思不出其位。止其所止。",
      love: "艮其背，不见其人。宜止欲。",
      wealth: "止损、止贪。",
      health: "静养、限位。",
      travel: "行其庭不见人，不宜访。",
      lawsuit: "止讼。",
      exam: "守范围。",
      decision: "宜止。时止则止。"
    },
    渐: {
      career: "女归吉。鸿渐于干至于陆，循序。",
      love: "本宜婚嫁之渐，不可跳步。",
      wealth: "渐进配置。",
      health: "渐养。",
      travel: "逐步迁移。",
      lawsuit: "程序推进。",
      exam: "循序渐进。",
      decision: "宜渐不宜骤。"
    },
    归妹: {
      career: "征凶无攸利。名分不正则不宜进。",
      love: "归妹之象，须正始。愆期有时则待。",
      wealth: "不正之财无攸利。",
      health: "关系紊乱及体。",
      travel: "不宜为不正之名而行。",
      lawsuit: "名分之争，不利。",
      exam: "走偏门则无攸利。",
      decision: "名不正则止。待时。"
    },
    丰: {
      career: "王假之，宜日中。盛极须明，勿忧。",
      love: "丰盛易蔽，日中见斗则疑。",
      wealth: "丰屋蔀家，富而封闭则凶。",
      health: "过盛则滞。",
      travel: "宜在明时。",
      lawsuit: "折狱致刑，明则宜。",
      exam: "发挥如日中。",
      decision: "处丰思明。宜日中，勿入蔀。"
    },
    旅: {
      career: "小亨旅贞吉。客位、出差、跳槽如旅，勿焚次。",
      love: "旅人先笑后号。不宜深栖。",
      wealth: "怀资得童仆，小财。丧牛则凶。",
      health: "在外不适，明慎。",
      travel: "本卦。小亨，慎刑慎留。",
      lawsuit: "客地之讼，速了。",
      exam: "在外考、借考场，细心。",
      decision: "可暂栖，不可为家。"
    },
    巽: {
      career: "申命行事。柔入、反复命令，利见大人。",
      love: "进退不定，用史巫纷若可吉。",
      wealth: "风闻之财，小亨。",
      health: "气郁、风症，宜疏。",
      travel: "随风，可往。",
      lawsuit: "文书、通知、反复沟通。",
      exam: "听令、跟大纲。",
      decision: "宜顺入、宜反复确认。小亨。"
    },
    兑: {
      career: "朋友讲习。和兑吉，来兑凶。",
      love: "悦。孚兑吉，商兑未宁则须界。",
      wealth: "口才、服务、喜悦经济。",
      health: "口舌肺金。",
      travel: "访友则吉。",
      lawsuit: "口舌，和则吉。",
      exam: "讨论、表达。",
      decision: "以和为贵。勿来兑取悦失己。"
    },
    涣: {
      career: "风行水上。散党、散忧，王假有庙则聚神。",
      love: "涣其躬无悔，涣其群元吉——散小团圆大。",
      wealth: "分散风险。",
      health: "表散、发汗之象。",
      travel: "利涉大川。",
      lawsuit: "散其党则吉。",
      exam: "思路打开。",
      decision: "宜散不宜固。涣汗大号可。"
    },
    节: {
      career: "制数度。苦节不可贞，安节甘节则亨。",
      love: "有节则久，苦节则伤。",
      wealth: "预算、节制则亨。",
      health: "起居有节。",
      travel: "按站、按程。",
      lawsuit: "依法有度。",
      exam: "时间分配。",
      decision: "有节则行。过节则凶。"
    },
    中孚: {
      career: "豚鱼吉。诚信及于微物，利涉大川。",
      love: "鹤鸣子和。孚则相应。",
      wealth: "信用、契约。",
      health: "心神须孚，议狱缓死之宽。",
      travel: "诚信之行利涉。",
      lawsuit: "议狱缓死，宽则吉。",
      exam: "诚实。",
      decision: "有孚则往。无孚则翰音登天凶。"
    },
    小过: {
      career: "可小事不可大事。宜下不宜上。",
      love: "过恭过哀可，大事不可。",
      wealth: "小额、谨慎。密云不雨。",
      health: "小过可调，大治不宜。",
      travel: "宜下、宜近。飞鸟以凶于上。",
      lawsuit: "小事可了，大案勿兴。",
      exam: "小处得分。",
      decision: "宜小、宜下、宜过恭。"
    },
    既济: {
      career: "初吉终乱。事已成，思患预防。",
      love: "既成须保，濡首则厉。",
      wealth: "落袋为安，终日戒。",
      health: "看似愈，防复发。",
      travel: "将至，仍戒濡。",
      lawsuit: "将了未了，小人勿用。",
      exam: "收官须慎。",
      decision: "成则守。勿以为完结。"
    },
    未济: {
      career: "小狐汔济。将成未成，慎辨物居方。",
      love: "未成，濡尾则吝。",
      wealth: "差临门一脚。",
      health: "未愈。",
      travel: "未济，利涉而征或凶。",
      lawsuit: "未了。",
      exam: "尚有一关。",
      decision: "未完成。慎终如始，不可自满。"
    }
  };

  const TRIGRAM_PLACE = {
    乾: "高亢、总部、西北、金属玻璃之境",
    兑: "口舌、湖泽、西方、欢场市集",
    离: "文明、南方、灯火屏幕、医院学校",
    震: "震动、东方、交通、新起之地",
    巽: "风入、东南、园林、命令传达之所",
    坎: "险陷、北方、江河港口、低洼",
    艮: "止、东北、山地、关隘门庭",
    坤: "厚载、西南、田野、基层承载"
  };

  function getLocalOracle(hex, eventId, context) {
    if (!hex) return null;
    const table = BY_EVENT[hex.name];
    const ev = eventId && table ? table[eventId] : null;
    const text = ev || (table && table.decision) || hex.daXiang;
    const bits = [];
    if (context && context.place) {
      bits.push(`就「${context.place}」而言，宜合其风土人情而断，不可执死辞。`);
    }
    if (context && context.direction) {
      bits.push(`问方在${context.direction}，地气偏${context.direction}，与卦之上${hex.upper}下${hex.lower}参看。`);
    }
    const upperHint = TRIGRAM_PLACE[hex.upper];
    const lowerHint = TRIGRAM_PLACE[hex.lower];
    if (upperHint && lowerHint) {
      bits.push(`上卦象：${upperHint}；下卦象：${lowerHint}。在当地取类比象。`);
    }
    return {
      eventText: text,
      localNotes: bits,
      essence: hex.daXiang
    };
  }

  function formatLocalBlock(hex, eventId, context) {
    const o = getLocalOracle(hex, eventId, context);
    if (!o) return "";
    return {
      title: `因地制宜 · ${hex.name}`,
      eventText: o.eventText,
      localNotes: o.localNotes
    };
  }

  window.YiOracleText = { BY_EVENT, TRIGRAM_PLACE, getLocalOracle, formatLocalBlock };
})();
