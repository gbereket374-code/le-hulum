window.LHP = (function () {
  const THEMES = {
    light: { bg:'#FBF8F3', sf:'#FFFFFF', s2:'#F4EEE5', s3:'#EAE2D6', tx:'#1B1714', mu:'#5C534A', bd:'#8A8076', ln:'#E4DCD0', pr:'#B23A12', op:'#FFFFFF', prh:'#92300F', prs:'#FBE7DD', prt:'#8E2E0E', in:'#2B3990', stg:'#1F2459', gd:'#F5C25B', ok:'#17663F', okb:'#E3F2E9', wn:'#8A4B00', wnb:'#FBEFD9', er:'#A1122F', erb:'#FBE4E8', fc:'#2B3990', scrim:'rgba(27,23,20,.55)', sh:'0 1px 2px rgba(27,23,20,.06), 0 10px 30px rgba(27,23,20,.07)' },
    dark: { bg:'#15110E', sf:'#1F1A16', s2:'#2A231E', s3:'#352C25', tx:'#F5EFE6', mu:'#C4B9AC', bd:'#8F8478', ln:'#3A322B', pr:'#FF9466', op:'#1A0D06', prh:'#FFAD8A', prs:'#3A2016', prt:'#FFB899', in:'#9DA8FF', stg:'#1A1E4A', gd:'#F5C25B', ok:'#6FD39C', okb:'#15301F', wn:'#F2B866', wnb:'#33260F', er:'#FF8A9B', erb:'#3A1820', fc:'#F5C25B', scrim:'rgba(0,0,0,.72)', sh:'0 1px 2px rgba(0,0,0,.4), 0 10px 30px rgba(0,0,0,.35)' },
    hcLight: { bg:'#FFFFFF', sf:'#FFFFFF', s2:'#FFFFFF', s3:'#F2F2F2', tx:'#000000', mu:'#000000', bd:'#000000', ln:'#000000', pr:'#7A1F00', op:'#FFFFFF', prh:'#000000', prs:'#FFFFFF', prt:'#7A1F00', in:'#00007A', stg:'#000033', gd:'#FFD23F', ok:'#004D1F', okb:'#FFFFFF', wn:'#5C3300', wnb:'#FFFFFF', er:'#7A0019', erb:'#FFFFFF', fc:'#000000', scrim:'rgba(0,0,0,.8)', sh:'none' },
    hcDark: { bg:'#000000', sf:'#000000', s2:'#000000', s3:'#1A1A1A', tx:'#FFFFFF', mu:'#FFFFFF', bd:'#FFFFFF', ln:'#FFFFFF', pr:'#FFE14D', op:'#000000', prh:'#FFFFFF', prs:'#000000', prt:'#FFE14D', in:'#7FDBFF', stg:'#000022', gd:'#FFE14D', ok:'#7CFFB2', okb:'#000000', wn:'#FFD27F', wnb:'#000000', er:'#FF9AAE', erb:'#000000', fc:'#00E5FF', scrim:'rgba(0,0,0,.85)', sh:'none' }
  };

  const T = {
    skip:['Skip to main content','ወደ ዋናው ይዘት ዝለል'], otherLang:['አማርኛ','English'], otherShort:['አማ','EN'],
    nav_how:['How it works','እንዴት እንደሚሠራ'], nav_uses:['Use cases','አጠቃቀሞች'], nav_pricing:['Pricing','ዋጋ'], nav_dev:['Developers','ለገንቢዎች'],
    login:['Log in','ግባ'], signup:['Sign up','ይመዝገቡ'], startFree:['Start free','በነጻ ይጀምሩ'], menu:['Menu','ምናሌ'], close:['Close','ዝጋ'],
    translate:['Translate','ተርጉም'], library:['Library','ቤተ መጻሕፍት'], dashboard:['Dashboard','ዳሽቦርድ'], org:['Organization','ድርጅት'], team:['Team','ቡድን'], settings:['Settings','ቅንብሮች'], states:['UI states','የገጽ ሁኔታዎች'], newTr:['New translation','አዲስ ትርጉም'], newShort:['New','አዲስ'],
    appNav:['App','መተግበሪያ'], mainNav:['Main','ዋና'], themeSystem:['System','የስርዓት'], themeLight:['Light','ብሩህ'], themeDark:['Dark','ጨለማ'], theme:['Theme','ገጽታ'],
    minutesMonth:['Minutes this month','የዚህ ወር ደቂቃዎች'], lowDataOn:['Low-data mode','አነስተኛ ዳታ'],
    offlineT:['You are offline.','ከመስመር ውጭ ነዎት።'], offlineD:['Saved lessons still play. New translations will start when you reconnect.','የተቀመጡ ትምህርቶች ይጫወታሉ። አዳዲስ ትርጉሞች ሲገናኙ ይጀምራሉ።'], retry:['Retry','እንደገና ሞክር'],
    lowDataBanner:['Low-data mode is on: lighter avatar, no thumbnails, captions first.','አነስተኛ ዳታ በርቷል፦ ቀላል አምሳያ፣ ያለ ምስሎች፣ ግርጌ ጽሑፍ ቅድሚያ።'], turnOff:['Turn off','አጥፋ'],
    audioBar:['Audio-first mode is on.','የድምፅ-ቅድሚያ ሁነታ በርቷል።'], readPage:['Read this page aloud','ይህን ገጽ ጮክ ብለህ አንብብ'], stopReading:['Stop reading','ማንበብ አቁም'],
    notifications:['Notifications','ማሳወቂያዎች'], dismiss:['Dismiss','አሰናብት'],

    heroKicker:['Ethiopian Sign Language, on demand','የኢትዮጵያ ምልክት ቋንቋ፣ በፈለጉት ጊዜ'],
    heroTitle:['Ear to the deaf. Eye for the blind.','ለመስማት ለተሳናቸው ጆሮ፣ ለማየት ለተሳናቸው ዓይን።'],
    heroSub:['LE HULUM turns Amharic and English text and video into Ethiopian Sign Language, with synced captions and audio description. Built with Deaf signers for schools, media and public services.','ለሁሉም የአማርኛ እና የእንግሊዝኛ ጽሑፍና ቪዲዮን ወደ ኢትዮጵያ ምልክት ቋንቋ ይተረጉማል፤ ከተመሳሰለ ግርጌ ጽሑፍ እና የድምፅ መግለጫ ጋር። ከመስማት የተሳናቸው ምልክት ሰጪዎች ጋር ለትምህርት ቤቶች፣ ለሚዲያ እና ለሕዝብ አገልግሎቶች የተሠራ።'],
    ctaStart:['Start translating free','በነጻ መተርጎም ይጀምሩ'], ctaDemo:['See plans','እቅዶችን ይመልከቱ'],
    trust1:['Co-designed with Deaf signers','ከመስማት የተሳናቸው ጋር የተነደፈ'], trust2:['WCAG 2.2 AA','WCAG 2.2 AA'], trust3:['Works on 3G','በ3G ይሠራል'],
    demoT:['Try it: pick a phrase','ይሞክሩት፦ ሐረግ ይምረጡ'], livePreview:['Live preview','ቀጥታ ቅድመ እይታ'], replay:['Replay','እንደገና'], pause:['Pause','አቁም'], play:['Play','አጫውት'],
    partnersLead:['Born at the Digital Bridge Accessibility Hackathon 2026 (ALX). Now piloting with:','በዲጂታል ብሪጅ የተደራሽነት ሃካቶን 2026 (ALX) የተወለደ። አሁን አብረውን የሚሞክሩ፦'],
    howKicker:['How it works','እንዴት እንደሚሠራ'], howT:['From lesson to sign in three steps','ከትምህርት ወደ ምልክት በሦስት ደረጃዎች'],
    howSub:['No interpreter booking, no editing software. Paste, translate, publish.','አስተርጓሚ መያዝ ወይም የአርትዖት ሶፍትዌር አያስፈልግም። ይለጥፉ፣ ይተርጉሙ፣ ያትሙ።'],
    usesKicker:['Use cases','አጠቃቀሞች'], usesT:['Built for the places people learn and get help','ሰዎች በሚማሩበት እና እርዳታ በሚያገኙበት ቦታ ሁሉ'], learnMore:['Learn more','ተጨማሪ ይወቁ'],
    impactKicker:['Our 2027 goals','የ2027 ግቦቻችን'], impactT:['Sign language access should be ordinary','የምልክት ቋንቋ ተደራሽነት የተለመደ መሆን አለበት'],
    impactNote:['These are targets, not results. We publish progress every quarter.','እነዚህ ግቦች እንጂ ውጤቶች አይደሉም። እድገታችንን በየሩብ ዓመቱ እናሳውቃለን።'],
    voicesKicker:['From the Deaf community','ከመስማት የተሳናቸው ማኅበረሰብ'], voicesT:['Designed with the people who use it','በሚጠቀሙት ሰዎች የተነደፈ'], watchInSign:['Watch in EthSL','በምልክት ቋንቋ ይመልከቱ'],
    pricingKicker:['Pricing','ዋጋ'], pricingTeaserT:['Free for learners. Fair for schools.','ለተማሪዎች ነጻ። ለትምህርት ቤቶች ተመጣጣኝ።'], comparePlans:['Compare all plans','ሁሉንም እቅዶች ያወዳድሩ'],
    ctaT:['Make your next lesson signable','ቀጣዩን ትምህርትዎን በምልክት ቋንቋ ያቅርቡ'], ctaSub:['Start free. No card needed. Pay later with Telebirr or Chapa.','በነጻ ይጀምሩ። ካርድ አያስፈልግም። በኋላ በቴሌብር ወይም በቻፓ ይክፈሉ።'],
    footTag:['Ethiopian Sign Language for every lesson, screen and service.','ለእያንዳንዱ ትምህርት፣ ማያ እና አገልግሎት የኢትዮጵያ ምልክት ቋንቋ።'],
    fProduct:['Product','ምርት'], fCompany:['Company','ድርጅት'], fAccess:['Accessibility','ተደራሽነት'], fAbout:['About us','ስለ እኛ'], fCareers:['Careers','ሥራ'], fContact:['Contact','አድራሻ'], fStatement:['Accessibility statement','የተደራሽነት መግለጫ'], fReport:['Report a barrier','እንቅፋት ያሳውቁ'], fGloss:['EthSL glossary','የምልክት መዝገበ ቃላት'], fApi:['API docs','API ሰነዶች'],
    rights:['© 2026 LE HULUM PLC · Addis Ababa','© 2026 ለሁሉም ኃ.የተ.የግ.ማ · አዲስ አበባ'], privacy:['Privacy','ግላዊነት'], terms:['Terms','ውሎች'],

    createAcc:['Create your account','መለያዎን ይፍጠሩ'], welcomeBack:['Welcome back','እንኳን ደህና መጡ'],
    authSubUp:['Free for learners. Takes under a minute.','ለተማሪዎች ነጻ። ከአንድ ደቂቃ ያነሰ ጊዜ ይወስዳል።'], authSubIn:['Log in to your translations and library.','ወደ ትርጉሞችዎ እና ቤተ መጻሕፍትዎ ይግቡ።'],
    fullName:['Full name','ሙሉ ስም'], emailPhone:['Email or phone number','ኢሜይል ወይም ስልክ ቁጥር'], emailHint:['For example hana@school.et or 0911 234 567','ለምሳሌ hana@school.et ወይም 0911 234 567'],
    password:['Password','የይለፍ ቃል'], pwHint:['At least 8 characters','ቢያንስ 8 ቁምፊዎች'], show:['Show','አሳይ'], hide:['Hide','ደብቅ'],
    agree:['I agree to the Terms and Privacy Policy','በውሎቹ እና በግላዊነት ፖሊሲው እስማማለሁ'], continue:['Continue','ቀጥል'], or:['or','ወይም'], phoneCode:['Continue with an SMS code','በኤስኤምኤስ ኮድ ቀጥል'],
    haveAcc:['Already have an account?','መለያ አለዎት?'], noAcc:['New to LE HULUM?','ለሁሉም ላይ አዲስ ነዎት?'], fixErrors:['Please fix','እባክዎ ያስተካክሉ'],
    errName:['Enter your full name.','ሙሉ ስምዎን ያስገቡ።'], errId:['Enter a valid email or Ethiopian phone number.','ትክክለኛ ኢሜይል ወይም የኢትዮጵያ ስልክ ቁጥር ያስገቡ።'], errPw:['Password must be at least 8 characters.','የይለፍ ቃል ቢያንስ 8 ቁምፊዎች መሆን አለበት።'], errTerms:['Accept the Terms to continue.','ለመቀጠል ውሎቹን ይቀበሉ።'],
    stepOf:['Step 2 of 2','ደረጃ 2 ከ 2'], roleT:['How will you use LE HULUM?','ለሁሉምን እንዴት ይጠቀማሉ?'], roleSub:['We tailor your home screen. You can change this later.','መነሻ ገጽዎን እናስተካክላለን። በኋላ መቀየር ይችላሉ።'],
    rLearner:['Learner','ተማሪ'], rLearnerD:['Watch lessons and content in sign language.','ትምህርቶችን እና ይዘቶችን በምልክት ቋንቋ ይመልከቱ።'],
    rEducator:['Educator or creator','መምህር ወይም ይዘት ፈጣሪ'], rEducatorD:['Upload lessons, translate, review and publish.','ትምህርቶችን ይጫኑ፣ ይተርጉሙ፣ ይገምግሙ እና ያትሙ።'],
    rOrg:['Organization','ድርጅት'], rOrgD:['Manage a team, usage, billing and API access.','ቡድንን፣ አጠቃቀምን፣ ክፍያን እና API ን ያስተዳድሩ።'], back:['Back','ተመለስ'], authQuote:['“When the lesson signs, I don’t wait for anyone to explain it to me later.”','“ትምህርቱ በምልክት ሲቀርብ፣ በኋላ እንዲያስረዳኝ ማንንም አልጠብቅም።”'], authQuoteBy:['Meron A., Deaf student, Addis Ababa','መሮን አ.፣ መስማት የተሳናት ተማሪ፣ አዲስ አበባ'],

    workspace:['Workspace','የሥራ ቦታ'], translateT:['Translate to sign language','ወደ ምልክት ቋንቋ ተርጉም'], input:['Input','ግብዓት'], inputLang:['Input language','የግብዓት ቋንቋ'], inputType:['Input type','የግብዓት ዓይነት'],
    tabText:['Text','ጽሑፍ'], tabVideo:['Upload video','ቪዲዮ ጫን'], tabLink:['Paste link','ሊንክ ለጥፍ'], amharic:['Amharic','አማርኛ'], english:['English','እንግሊዝኛ'],
    textLabel:['Text to translate','የሚተረጎም ጽሑፍ'], textPh:['Type or paste a lesson, notice or message…','ትምህርት፣ ማስታወቂያ ወይም መልእክት ይጻፉ ወይም ይለጥፉ…'], useSample:['Use sample lesson','ናሙና ትምህርት ተጠቀም'], clear:['Clear','አጽዳ'],
    chars:['characters','ቁምፊዎች'], errEmpty:['Enter some text to translate.','የሚተረጎም ጽሑፍ ያስገቡ።'],
    dropT:['Drag a lesson video here','የትምህርት ቪዲዮ እዚህ ይጎትቱ'], chooseVideo:['Choose video','ቪዲዮ ምረጥ'], formats:['MP4, MOV or WebM · up to 500 MB · up to 30 minutes','MP4፣ MOV ወይም WebM · እስከ 500 ሜባ · እስከ 30 ደቂቃ'], useSampleVideo:['Use sample video','ናሙና ቪዲዮ ተጠቀም'], remove:['Remove','አስወግድ'],
    unsupported:['Unsupported file','የማይደገፍ ፋይል'], unsupportedD:['This file is not a video we can read. Choose an MP4, MOV or WebM file under 500 MB.','ይህ ፋይል ልናነበው የምንችለው ቪዲዮ አይደለም። ከ500 ሜባ በታች MP4፣ MOV ወይም WebM ይምረጡ።'], chooseAnother:['Choose another file','ሌላ ፋይል ምረጥ'], errNoFile:['Choose a video or use the sample.','ቪዲዮ ይምረጡ ወይም ናሙናውን ይጠቀሙ።'],
    linkLabel:['Lesson link','የትምህርት ሊንክ'], linkHint:['YouTube, Google Drive, Savanna or any public video URL','ዩቲዩብ፣ ጉግል ድራይቭ፣ ሳቫና ወይም ማንኛውም ይፋዊ የቪዲዮ ሊንክ'], errLink:['Enter a full link that starts with https://','በ https:// የሚጀምር ሙሉ ሊንክ ያስገቡ።'], useSampleLink:['Use sample link','ናሙና ሊንክ ተጠቀም'],
    toTranslate:['to translate','ለመተርጎም'], translateBtn:['Translate to EthSL','ወደ ምልክት ቋንቋ ተርጉም'], translating:['Translating…','በመተርጎም ላይ…'], output:['Sign language output','የምልክት ቋንቋ ውጤት'], outLang:['Output: Ethiopian Sign Language','ውጤት፦ የኢትዮጵያ ምልክት ቋንቋ'],
    idleT:['Your sign translation appears here','የምልክት ትርጉምዎ እዚህ ይታያል'], idleD:['Add text, a video or a link, then choose Translate. Most lessons are ready in under a minute.','ጽሑፍ፣ ቪዲዮ ወይም ሊንክ ያክሉ፣ ከዚያ ተርጉም ይጫኑ። አብዛኞቹ ትምህርቶች ከአንድ ደቂቃ በታች ይዘጋጃሉ።'],
    st1Text:['Reading text','ጽሑፍ በማንበብ ላይ'], st1Media:['Transcribing audio','ድምፅን ወደ ጽሑፍ በመቀየር ላይ'], st2:['Translating to EthSL grammar','ወደ ምልክት ቋንቋ ሰዋስው በመተርጎም ላይ'], st3:['Rendering signs','ምልክቶችን በማዘጋጀት ላይ'],
    stDone:['Done','ተጠናቋል'], stNow:['In progress','በሂደት ላይ'], stWait:['Waiting','በመጠባበቅ ላይ'], cancel:['Cancel','ሰርዝ'], aboutLeft:['About','ገደማ'], secLeft:['seconds left','ሰከንዶች ቀርተዋል'], procT:['Translating your content','ይዘትዎ እየተተረጎመ ነው'],
    failT:['Translation failed','ትርጉሙ አልተሳካም'], failD:['We could not translate this. The audio may be too quiet, or the link may be private.','ይህንን መተርጎም አልቻልንም። ድምፁ በጣም ዝቅተኛ ወይም ሊንኩ የግል ሊሆን ይችላል።'], tryAgain:['Try again','እንደገና ሞክር'], editInput:['Edit input','ግብዓቱን አስተካክል'], contactSupport:['Contact support','ድጋፍ ያግኙ'], errorCode:['Error code','የስህተት ኮድ'],
    readyT:['Translation ready','ትርጉሙ ዝግጁ ነው'], aiBadge:['AI translation · not yet reviewed','የAI ትርጉም · ገና አልተገመገመም'],
    sentence:['Sentence','ዓረፍተ ነገር'], of:['of','ከ'], replaySent:['Replay sentence','ዓረፍተ ነገሩን ድገም'], prev:['Previous','ቀዳሚ'], next:['Next','ቀጣይ'], loop:['Loop','ድገም'], speed:['Speed','ፍጥነት'], fullscreen:['Full screen','ሙሉ ማያ'], exitFs:['Exit full screen','ከሙሉ ማያ ውጣ'], download:['Download','አውርድ'], share:['Share','አጋራ'],
    timeline:['Sentence timeline','የዓረፍተ ነገሮች ቅደም ተከተል'], signingNow:['Signing now','አሁን በምልክት ላይ'], showGloss:['Gloss','ግሎስ'],
    titleLabel:['Title','ርዕስ'], saveLib:['Save to library','ወደ ቤተ መጻሕፍት አስቀምጥ'], savedLib:['Saved to library','ወደ ቤተ መጻሕፍት ተቀምጧል'], viewLib:['View in library','በቤተ መጻሕፍት ይመልከቱ'], untitled:['Untitled translation','ርዕስ የሌለው ትርጉም'],
    cancelled:['Translation cancelled','ትርጉሙ ተሰርዟል'],

    shareT:['Share translation','ትርጉሙን አጋራ'], shareLink:['Share link','የማጋሪያ ሊንክ'], copy:['Copy','ቅዳ'], copied:['Copied','ተቀድቷል'], embed:['Embed on your site','በድረ ገጽዎ ውስጥ ያስገቡ'], whoCan:['Who can view','ማን ማየት ይችላል'], anyone:['Anyone with the link','ሊንኩ ያለው ማንኛውም ሰው'], orgOnly:['Only my organization','የእኔ ድርጅት ብቻ'], done:['Done','ተከናውኗል'],
    downloadT:['Download','አውርድ'], dlVideo:['Sign video · MP4 720p','የምልክት ቪዲዮ · MP4 720p'], dlLight:['Low-data sign video · MP4 360p','አነስተኛ ዳታ ቪዲዮ · MP4 360p'], dlVtt:['Captions · WebVTT','ግርጌ ጽሑፍ · WebVTT'], dlGloss:['Gloss transcript · TXT','የግሎስ ጽሑፍ · TXT'], recommended:['Recommended','የሚመከር'], dlStarted:['Download started','ማውረድ ተጀምሯል'], dlRendering:['Rendering your video. We will notify you when it is ready.','ቪዲዮዎ እየተዘጋጀ ነው። ሲዘጋጅ እናሳውቅዎታለን።'],

    lessonOf:['Lesson','ትምህርት'], original:['Original video','ዋናው ቪዲዮ'], captions:['Captions','ግርጌ ጽሑፍ'], sign:['Sign','ምልክት'], transcript:['Transcript','ግልባጭ'], back10:['Back 10 s','ወደኋላ 10'], fwd10:['Forward 10 s','ወደፊት 10'], seek:['Seek','ቦታ ፈልግ'],
    signWindow:['Sign window','የምልክት መስኮት'], move:['Move','አንቀሳቅስ'], smaller:['Smaller','አሳንስ'], larger:['Larger','አስፋ'], corner:['Corner','ጥግ'], tl:['Top left','ላይ ግራ'], tr:['Top right','ላይ ቀኝ'], bl:['Bottom left','ታች ግራ'], br:['Bottom right','ታች ቀኝ'], follow:['Follow along','አብረህ ተከተል'], editTr:['Edit translation','ትርጉሙን አስተካክል'], views:['views','እይታዎች'],

    libT:['Library','ቤተ መጻሕፍት'], lessons:['lessons','ትምህርቶች'], search:['Search lessons','ትምህርቶችን ፈልግ'], subject:['Subject','የትምህርት ዓይነት'], language:['Language','ቋንቋ'], date:['Date','ቀን'], status:['Status','ሁኔታ'], all:['All','ሁሉም'], anyTime:['Any time','ማንኛውም ጊዜ'], d7:['Last 7 days','ያለፉት 7 ቀናት'], d30:['Last 30 days','ያለፉት 30 ቀናት'],
    stPublished:['Published','ታትሟል'], stDraft:['Draft','ረቂቅ'], stProcessing:['Processing','በሂደት ላይ'], stFailed:['Failed','አልተሳካም'], grid:['Grid','ፍርግርግ'], list:['List','ዝርዝር'], view:['View','እይታ'], sort:['Sort','ደርድር'], recent:['Most recent','የቅርብ ጊዜ'], popular:['Most viewed','በብዛት የታየ'], az:['Title A–Z','ርዕስ ሀ–ፐ'],
    filters:['Filters','ማጣሪያዎች'], clearFilters:['Clear filters','ማጣሪያዎችን አጽዳ'], noMatchT:['No lessons match these filters','ከእነዚህ ማጣሪያዎች ጋር የሚዛመድ ትምህርት የለም'], noMatchD:['Try a different word or clear the filters.','ሌላ ቃል ይሞክሩ ወይም ማጣሪያዎቹን ያጽዱ።'],
    emptyT:['Your library is empty','ቤተ መጻሕፍትዎ ባዶ ነው'], emptyD:['Translations you save appear here, ready to share, embed or download.','የሚያስቀምጧቸው ትርጉሞች እዚህ ይታያሉ፤ ለማጋራት፣ ለማስገባት ወይም ለማውረድ ዝግጁ።'], firstTr:['Translate your first lesson','የመጀመሪያ ትምህርትዎን ይተርጉሙ'], newBadge:['New','አዲስ'], open:['Open','ክፈት'], updated:['Updated','የተሻሻለ'], duration:['Duration','ርዝመት'], title:['Title','ርዕስ'], showing:['Showing','እየታየ'],

    goodDay:['Good afternoon','እንደምን ዋሉ'], dashSub:['Here is what is happening with your lessons.','በትምህርቶችዎ ላይ ያለው ሁኔታ ይኸው።'], quickUp:['Quick upload','ፈጣን ጭነት'], quickUpD:['Drop a lesson video to translate it now.','አሁን ለመተርጎም የትምህርት ቪዲዮ ይጣሉ።'],
    statLessons:['Lessons published','የታተሙ ትምህርቶች'], statMinutes:['Minutes translated','የተተረጎሙ ደቂቃዎች'], statViews:['Learner views, 30 days','የተማሪ እይታዎች፣ 30 ቀናት'], statReview:['Awaiting review','ግምገማ የሚጠብቁ'], vsLast:['vs last month','ካለፈው ወር ጋር'],
    trStatus:['Translation status','የትርጉም ሁኔታ'], activity:['Recent activity','የቅርብ ጊዜ እንቅስቃሴ'], review:['Review','ገምግም'], viewAll:['View all','ሁሉንም ይመልከቱ'], action:['Action','ተግባር'],

    orgName:['Entoto Inclusive Academy','እንጦጦ አካታች አካዳሚ'], members:['Members','አባላት'], usage:['Usage','አጠቃቀም'], billing:['Billing','ክፍያ'], apiKeys:['API keys','API ቁልፎች'], invite:['Invite member','አባል ጋብዝ'], name:['Name','ስም'], email:['Email','ኢሜይል'], role:['Role','ሚና'], lastActive:['Last active','መጨረሻ የታየው'], active:['Active','ንቁ'], invited:['Invited','ተጋብዟል'],
    roleAdmin:['Admin','አስተዳዳሪ'], roleEducator:['Educator','መምህር'], roleReviewer:['Sign reviewer','የምልክት ገምጋሚ'], roleLearner:['Learner','ተማሪ'], removed:['Member removed','አባሉ ተወግዷል'], undo:['Undo','ቀልብስ'], roleChanged:['Role updated','ሚናው ተቀይሯል'], inviteSent:['Invitation sent','ግብዣ ተልኳል'], errEmail:['Enter a valid email address.','ትክክለኛ ኢሜይል ያስገቡ።'], sendInvite:['Send invitation','ግብዣ ላክ'],
    quotaT:['Translation minutes','የትርጉም ደቂቃዎች'], used:['used','ጥቅም ላይ ውሏል'], resets:['Resets on 1 December 2026','በታኅሣሥ 1, 2026 ዳግም ይጀምራል'], seats:['Seats','መቀመጫዎች'], storage:['Storage','ማከማቻ'], byMonth:['Minutes by month','ደቂቃዎች በወር'], quotaWarn:['74% used with 15 days left. You are on track to reach the limit around 26 November.','15 ቀናት እየቀሩ 74% ጥቅም ላይ ውሏል። በኅዳር 26 አካባቢ ገደቡ ላይ ይደርሳሉ።'], addMinutes:['Add minutes','ደቂቃ ጨምር'],
    curPlan:['Current plan','የአሁኑ እቅድ'], renews:['Renews 1 December 2026','በታኅሣሥ 1, 2026 ይታደሳል'], changePlan:['Change plan','እቅድ ቀይር'], payMethod:['Payment method','የክፍያ ዘዴ'], invoices:['Invoices','ደረሰኞች'], paid:['Paid','ተከፍሏል'], amount:['Amount','መጠን'], savePay:['Save payment method','የክፍያ ዘዴ አስቀምጥ'], paySaved:['Payment method saved','የክፍያ ዘዴ ተቀምጧል'],
    telebirrD:['Pay from your Telebirr wallet. Auto-renew each month.','ከቴሌብር ቦርሳዎ ይክፈሉ። በየወሩ በራስ-ሰር ይታደሳል።'], chapaD:['Bank transfer, CBE Birr, M-Pesa or card through Chapa.','በቻፓ በኩል የባንክ ዝውውር፣ ሲቢኢ ብር፣ ኤም-ፔሳ ወይም ካርድ።'], cardD:['Visa or Mastercard, billed in ETB.','ቪዛ ወይም ማስተርካርድ፣ በብር የሚከፈል።'],
    keysD:['Use API keys to translate content from your own platform. Keep keys secret.','ከራስዎ መድረክ ይዘትን ለመተርጎም API ቁልፎችን ይጠቀሙ። ቁልፎችን በምስጢር ይያዙ።'], createKey:['Create key','ቁልፍ ፍጠር'], keyName:['Key name','የቁልፍ ስም'], scopes:['Permissions','ፈቃዶች'], created:['Created','የተፈጠረ'], lastUsed:['Last used','መጨረሻ የተጠቀመው'], revoke:['Revoke','ሰርዝ'], revoked:['Revoked','ተሰርዟል'],
    keyOnce:['Copy this key now. For your security we will not show it again.','ይህን ቁልፍ አሁን ይቅዱ። ለደኅንነትዎ ዳግመኛ አናሳየውም።'], keyStored:['I have stored the key','ቁልፉን አስቀምጫለሁ'], revokeT:['Revoke this key?','ይህ ቁልፍ ይሰረዝ?'], revokeD:['Apps using this key will stop working immediately. This cannot be undone.','ይህን ቁልፍ የሚጠቀሙ መተግበሪያዎች ወዲያውኑ መሥራት ያቆማሉ። ይህ ሊቀለበስ አይችልም።'], keyRevoked:['Key revoked','ቁልፉ ተሰርዟል'], errKeyName:['Give the key a name.','ለቁልፉ ስም ይስጡ።'], scopeTr:['Translate content','ይዘት መተርጎም'], scopeLib:['Read and write library','ቤተ መጻሕፍትን ማንበብና መጻፍ'], scopeUsage:['Read usage','አጠቃቀምን ማንበብ'],

    pricingT:['Simple pricing in birr','ቀላል ዋጋ በብር'], pricingSub:['Free for Deaf learners, always. Pay with Telebirr, Chapa or card.','ለመስማት ለተሳናቸው ተማሪዎች ሁልጊዜ ነጻ። በቴሌብር፣ በቻፓ ወይም በካርድ ይክፈሉ።'], monthly:['Monthly','ወርሃዊ'], annual:['Annual','ዓመታዊ'], save20:['Save 20%','20% ይቆጥቡ'], perMonth:['/ month','/ በወር'], billedYearly:['billed yearly','በዓመት የሚከፈል'], custom:['Custom','በስምምነት'], mostPopular:['Best for schools','ለትምህርት ቤቶች ምርጥ'], payWith:['Pay with','በዚህ ይክፈሉ'], faq:['Questions','ጥያቄዎች'], discount:['Deaf associations and public schools get 50% off Institution. Ask us.','የመስማት የተሳናቸው ማኅበራት እና የመንግሥት ትምህርት ቤቶች በተቋም እቅድ 50% ቅናሽ ያገኛሉ።'],

    setT:['Settings and accessibility','ቅንብሮች እና ተደራሽነት'], setSub:['Changes save automatically and apply everywhere, including embedded players.','ለውጦች በራስ-ሰር ይቀመጣሉ፤ በሁሉም ቦታ ይተገበራሉ።'], savedAuto:['Saved','ተቀምጧል'], preview:['Preview','ቅድመ እይታ'], resetDefaults:['Reset to defaults','ወደ ነባሪ መልስ'],
    secSigning:['Signing','ምልክት'], avatarChoice:['Signer','ምልክት ሰጪ'], avSelam:['Selam · avatar','ሰላም · አምሳያ'], avDawit:['Dawit · avatar','ዳዊት · አምሳያ'], avVideo:['Human signer video','የሰው ምልክት ሰጪ ቪዲዮ'], avVideoD:['Uses more data','ብዙ ዳታ ይጠቀማል'], avAvatarD:['Light on data','አነስተኛ ዳታ'],
    signSpeed:['Signing speed','የምልክት ፍጥነት'], showGlossL:['Show gloss under the signer','ከምልክት ሰጪው በታች ግሎስ አሳይ'],
    secCaptions:['Captions','ግርጌ ጽሑፍ'], capSize:['Caption size','የግርጌ ጽሑፍ መጠን'], capBg:['Caption background','የግርጌ ጽሑፍ ዳራ'], solid:['Solid','ሙሉ'], seeThrough:['See-through','ግልጽ'],
    secDisplay:['Display','ማሳያ'], hc:['High contrast','ከፍተኛ ንፅፅር'], hcD:['Pure black and white with stronger borders.','ንጹሕ ጥቁር እና ነጭ ከጠንካራ ድንበሮች ጋር።'], rm:['Reduce motion','እንቅስቃሴ ቀንስ'], rmD:['Stops transitions and autoplay. Signs still play when you press Play.','ሽግግሮችን እና ራስ-አጫውትን ያቆማል።'], on:['On','በርቷል'], off:['Off','ጠፍቷል'],
    dys:['Dyslexia-friendly font','ለዲስሌክሲያ ተስማሚ ፊደል'], dysD:['Uses Lexend for Latin text with wider spacing.','ለላቲን ጽሑፍ ሌክሰንድን ይጠቀማል።'], textSize:['Text size','የጽሑፍ መጠን'],
    secLang:['Language','ቋንቋ'], uiLang:['Interface language','የመተግበሪያ ቋንቋ'], defInLang:['Default input language','ነባሪ የግብዓት ቋንቋ'],
    secAudio:['Audio and alerts','ድምፅ እና ማንቂያዎች'], audioFirst:['Audio-first mode','የድምፅ-ቅድሚያ ሁነታ'], audioFirstD:['Reads pages and translations aloud and adds a Read aloud bar. Works with TalkBack, VoiceOver and NVDA.','ገጾችን እና ትርጉሞችን ጮክ ብሎ ያነባል።'], readCaps:['Read captions aloud','ግርጌ ጽሑፍን ጮክ ብለህ አንብብ'], flashAlerts:['Visual alerts','የእይታ ማንቂያዎች'], flashAlertsD:['Flash the screen edge when a translation is ready. We never use sound alone.','ትርጉም ሲዘጋጅ የማያውን ጠርዝ ያበራል። ድምፅን ብቻ በፍጹም አንጠቀምም።'],
    secData:['Data','ዳታ'], lowData:['Low-data mode','አነስተኛ ዳታ ሁነታ'], lowDataD:['Avatar instead of video, no thumbnails, captions load first. Saves about 80% data.','ከቪዲዮ ይልቅ አምሳያ፣ ያለ ምስሎች፣ ግርጌ ጽሑፍ ቅድሚያ። 80% ገደማ ዳታ ይቆጥባል።'],

    statesT:['States and edge cases','ሁኔታዎች እና ልዩ ጉዳዮች'], statesSub:['Every screen handles loading, empty, error and offline states. Open each one in context.','እያንዳንዱ ገጽ የመጫን፣ ባዶ፣ የስህተት እና ከመስመር ውጭ ሁኔታዎችን ይይዛል።'], openInContext:['Open in context','በቦታው ክፈት'], simulateOffline:['Simulate offline','ከመስመር ውጭ አስመስል'], loadingT:['Loading','በመጫን ላይ'],
    nfT:['We could not find that page','ያንን ገጽ ማግኘት አልቻልንም'], nfD:['The link may be old or mistyped. These might help:','ሊንኩ የቆየ ወይም በስህተት የተጻፈ ሊሆን ይችላል። እነዚህ ሊረዱ ይችላሉ፦'], goHome:['Go to home','ወደ መነሻ ሂድ']
  };

  const SAMPLE = {
    en: [
      { s:'Good morning, everyone.', g:'GOOD MORNING ALL' },
      { s:'Today we will learn how plants make their own food.', g:'TODAY WE LEARN PLANT FOOD MAKE HOW' },
      { s:'Plants use sunlight, water and air.', g:'PLANT USE SUN WATER AIR' },
      { s:'This process is called photosynthesis.', g:'THIS PROCESS NAME P-H-O-T-O' },
      { s:'Do you have any questions?', g:'YOU QUESTION HAVE?' }
    ],
    am: [
      { s:'እንደምን አደራችሁ ሁላችሁም።', g:'ጥሩ ጠዋት ሁሉም' },
      { s:'ዛሬ ዕፅዋት የራሳቸውን ምግብ እንዴት እንደሚሠሩ እንማራለን።', g:'ዛሬ ተክል ምግብ መሥራት እንዴት እኛ መማር' },
      { s:'ዕፅዋት የፀሐይ ብርሃንን፣ ውሃን እና አየርን ይጠቀማሉ።', g:'ተክል ፀሐይ ውሃ አየር መጠቀም' },
      { s:'ይህ ሂደት ፎቶሲንተሲስ ይባላል።', g:'ይህ ሂደት ስም ፎ-ቶ' },
      { s:'ጥያቄ አላችሁ?', g:'እናንተ ጥያቄ አለ?' }
    ]
  };
  const DEMO = [
    { en:'Hello, welcome to class.', am:'ሰላም፣ ወደ ክፍል እንኳን ደህና መጡ።', gen:'HELLO WELCOME CLASS', gam:'ሰላም እንኳን-ደህና-መጡ ክፍል' },
    { en:'Where is the clinic?', am:'ክሊኒኩ የት ነው?', gen:'CLINIC WHERE?', gam:'ክሊኒክ የት?' },
    { en:'The exam starts at nine.', am:'ፈተናው በሦስት ሰዓት ይጀምራል።', gen:'EXAM START TIME NINE', gam:'ፈተና ጀምር ሰዓት ሦስት' }
  ];
  const STOP = new Set('a an the is are am was were be been being to of will would shall should that which it its please just very really'.split(' '));
  function split(text) {
    return String(text || '').replace(/\s+/g, ' ').trim().split(/(?<=[.!?።፧?])\s+/).map(s => s.trim()).filter(Boolean);
  }
  function gloss(s, lang) {
    if (lang === 'am') return s.replace(/[።፣፤፥፦,.!“”"]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 9).join(' ') + (/[?፧]$/.test(s) ? '?' : '');
    const q = /\?\s*$/.test(s);
    const w = s.toLowerCase().replace(/[^a-z0-9'\- ]/g, ' ').split(/\s+/).filter(x => x && !STOP.has(x)).slice(0, 9).map(x => x.toUpperCase());
    if (q && w.length) w[w.length - 1] += '?';
    return w.join(' ') || '…';
  }
  function build(text, lang) {
    const smp = SAMPLE[lang].map(x => x.s).join(' ');
    if (text.replace(/\s+/g, ' ').trim() === smp) return SAMPLE[lang].map(x => ({ s:x.s, g:x.g }));
    return split(text).slice(0, 40).map(s => ({ s, g: gloss(s, lang) }));
  }

  const SUBJ = { science:['Science','ሳይንስ'], math:['Math','ሒሳብ'], health:['Health','ጤና'], ict:['ICT','አይሲቲ'], civic:['Civics','ሥነ ዜጋ'], language:['Language','ቋንቋ'], general:['General','አጠቃላይ'] };
  const LIB = [
    { id:'l1', en:'Photosynthesis basics', am:'የፎቶሲንተሲስ መሠረታዊ ነገሮች', subj:'science', lang:'am', status:'published', dur:'4:12', views:1240, date:'2026-11-12' },
    { id:'l2', en:'Fractions with everyday objects', am:'ክፍልፋዮች በዕለት ተዕለት ዕቃዎች', subj:'math', lang:'am', status:'published', dur:'6:30', views:980, date:'2026-11-09' },
    { id:'l3', en:'Hand washing and hygiene', am:'እጅ መታጠብ እና ንጽሕና', subj:'health', lang:'en', status:'published', dur:'2:45', views:3110, date:'2026-11-05' },
    { id:'l4', en:'Python: Your first variable', am:'ፓይተን፡ የመጀመሪያ ተለዋዋጭዎ', subj:'ict', lang:'en', status:'draft', dur:'1:00', views:0, date:'2026-11-14' },
    { id:'l5', en:'Know your voting rights', am:'የምርጫ መብትዎን ይወቁ', subj:'civic', lang:'am', status:'processing', pct:62, dur:'5:20', views:0, date:'2026-11-15' },
    { id:'l6', en:'Reading the ሀ family of fidel', am:'የአማርኛ ንባብ፡ የሀ ቤት', subj:'language', lang:'am', status:'published', dur:'3:58', views:760, date:'2026-10-28' },
    { id:'l7', en:'Road safety for children', am:'ለልጆች የመንገድ ደኅንነት', subj:'civic', lang:'en', status:'failed', dur:'3:05', views:0, date:'2026-11-13' },
    { id:'l8', en:'Preventing malaria at home', am:'ወባን በቤት ውስጥ መከላከል', subj:'health', lang:'am', status:'published', dur:'4:40', views:2040, date:'2026-10-21' }
  ];
  const MEMBERS = [
    { id:'m1', name:'Hana Tesfaye', email:'hana@entoto.edu.et', role:'admin', status:'active', last:['Today','ዛሬ'] },
    { id:'m2', name:'Meron Alemu', email:'meron@entoto.edu.et', role:'reviewer', status:'active', last:['Today','ዛሬ'], deaf:true },
    { id:'m3', name:'Yonas Bekele', email:'yonas@entoto.edu.et', role:'educator', status:'active', last:['Yesterday','ትናንት'] },
    { id:'m4', name:'Dawit Girma', email:'dawit@entoto.edu.et', role:'educator', status:'active', last:['3 days ago','ከ3 ቀናት በፊት'] },
    { id:'m5', name:'Selamawit Haile', email:'selam@entoto.edu.et', role:'learner', status:'active', last:['Last week','ባለፈው ሳምንት'], deaf:true },
    { id:'m6', name:'Bethlehem Assefa', email:'betty@entoto.edu.et', role:'educator', status:'invited', last:['—','—'] }
  ];
  const KEYS = [
    { id:'k1', name:'Savanna LMS', last4:'3f9a', created:'2026-09-02', used:['2 minutes ago','ከ2 ደቂቃ በፊት'], scopes:'translate, library', status:'active' },
    { id:'k2', name:'Staging', last4:'a71c', created:'2026-10-18', used:['3 days ago','ከ3 ቀናት በፊት'], scopes:'translate', status:'active' }
  ];
  const INVOICES = [
    { id:'INV-2026-11', month:['November 2026','ኅዳር 2019'], amount:'ETB 9,500', via:'Telebirr' },
    { id:'INV-2026-10', month:['October 2026','ጥቅምት 2019'], amount:'ETB 9,500', via:'Telebirr' },
    { id:'INV-2026-09', month:['September 2026','መስከረም 2019'], amount:'ETB 9,500', via:'Chapa' }
  ];
  const USAGE = [['Jun','ሰኔ',3100],['Jul','ሐምሌ',4200],['Aug','ነሐሴ',2400],['Sep','መስከረም',6800],['Oct','ጥቅምት',8900],['Nov','ኅዳር',7420]];
  const ACTIVITY = [
    { icon:'verified', en:'Meron Alemu reviewed the signs in “Hand washing and hygiene”.', am:'መሮን አለሙ በ“እጅ መታጠብ እና ንጽሕና” ያሉትን ምልክቶች ገመገመች።', when:['12 min ago','ከ12 ደቂቃ በፊት'] },
    { icon:'visibility', en:'“Photosynthesis basics” passed 1,000 learner views.', am:'“የፎቶሲንተሲስ መሠረታዊ ነገሮች” ከ1,000 እይታ በላይ ደረሰ።', when:['2 h ago','ከ2 ሰዓት በፊት'] },
    { icon:'error', en:'“Road safety for children” failed: the audio is too quiet.', am:'“ለልጆች የመንገድ ደኅንነት” አልተሳካም፦ ድምፁ በጣም ዝቅተኛ ነው።', when:['5 h ago','ከ5 ሰዓት በፊት'] },
    { icon:'upload', en:'Yonas Bekele uploaded “Fractions with everyday objects”.', am:'ዮናስ በቀለ “ክፍልፋዮች በዕለት ተዕለት ዕቃዎች” ጫነ።', when:['Yesterday','ትናንት'] }
  ];
  const PLANS = [
    { id:'free', name:['Free','ነጻ'], who:['For Deaf learners and families','ለመስማት ለተሳናቸው ተማሪዎች እና ቤተሰቦች'], m:0, y:0, cta:['Start free','በነጻ ይጀምሩ'], href:'#/auth/signup',
      f:[['30 translation minutes a month','በወር 30 የትርጉም ደቂቃዎች'],['Avatar signer and captions','አምሳያ ምልክት ሰጪ እና ግርጌ ጽሑፍ'],['Low-data mode and offline viewing','አነስተኛ ዳታ እና ከመስመር ውጭ እይታ'],['Amharic and English input','የአማርኛ እና የእንግሊዝኛ ግብዓት']] },
    { id:'edu', name:['Educator','መምህር'], who:['For teachers and creators','ለመምህራን እና ይዘት ፈጣሪዎች'], m:450, y:360, cta:['Start 14-day trial','የ14 ቀን ሙከራ ጀምር'], href:'#/auth/signup',
      f:[['600 minutes a month','በወር 600 ደቂቃዎች'],['Video and link upload','የቪዲዮ እና የሊንክ ጭነት'],['Library, share and embed','ቤተ መጻሕፍት፣ ማጋራት እና ማስገባት'],['Download MP4 and captions','MP4 እና ግርጌ ጽሑፍ ማውረድ']] },
    { id:'inst', name:['Institution','ተቋም'], who:['For schools, universities and NGOs','ለትምህርት ቤቶች፣ ዩኒቨርሲቲዎች እና ድርጅቶች'], m:9500, y:7600, cta:['Start 30-day pilot','የ30 ቀን ሙከራ ጀምር'], href:'#/auth/signup', pop:true,
      f:[['10,000 minutes a month','በወር 10,000 ደቂቃዎች'],['25 seats with roles','25 መቀመጫዎች ከሚናዎች ጋር'],['Deaf reviewer workflow','የመስማት የተሳናቸው ገምጋሚ ሂደት'],['Usage reports and invoices in ETB','የአጠቃቀም ሪፖርት እና በብር ደረሰኝ']] },
    { id:'ent', name:['Enterprise and API','ኢንተርፕራይዝ እና API'], who:['For media, telecoms and government','ለሚዲያ፣ ቴሌኮም እና መንግሥት'], m:null, y:null, cta:['Talk to us','ያነጋግሩን'], href:'#/org/api',
      f:[['Translation API and SDKs','የትርጉም API እና SDK'],['Human signer review on request','በጥያቄ የሰው ምልክት ሰጪ ግምገማ'],['SLA, SSO and audit logs','SLA፣ SSO እና የኦዲት መዝገብ'],['Data hosted in Ethiopia','መረጃ በኢትዮጵያ ውስጥ የሚቀመጥ']] }
  ];
  const FAQ = [
    { q:['Who checks the sign language?','የምልክት ቋንቋውን ማን ያረጋግጣል?'], a:['Every model update is tested by Deaf EthSL signers on our team. Institution and Enterprise plans can route translations to a Deaf reviewer before publishing.','እያንዳንዱ ማሻሻያ በቡድናችን ውስጥ ባሉ መስማት የተሳናቸው ምልክት ሰጪዎች ይፈተናል። የተቋም እና የኢንተርፕራይዝ እቅዶች ትርጉሞችን ከመታተማቸው በፊት ወደ ገምጋሚ መላክ ይችላሉ።'] },
    { q:['Can I pay with Telebirr?','በቴሌብር መክፈል እችላለሁ?'], a:['Yes. Pay with Telebirr, or through Chapa with bank transfer, CBE Birr, M-Pesa or card. Invoices are in birr.','አዎ። በቴሌብር ወይም በቻፓ በኩል በባንክ ዝውውር፣ በሲቢኢ ብር፣ በኤም-ፔሳ ወይም በካርድ ይክፈሉ። ደረሰኞች በብር ናቸው።'] },
    { q:['Does it work on slow connections?','በዝግተኛ ግንኙነት ይሠራል?'], a:['Yes. Low-data mode uses the avatar instead of video and loads captions first, which uses about 80% less data.','አዎ። አነስተኛ ዳታ ሁነታ ከቪዲዮ ይልቅ አምሳያ ይጠቀማል እና ግርጌ ጽሑፍን ቅድሚያ ይጭናል።'] },
    { q:['What happens to my content?','ይዘቴ ምን ይሆናል?'], a:['You own it. We do not train models on your content without written permission.','ይዘቱ የእርስዎ ነው። ያለ ጽሑፍ ፈቃድ ሞዴሎችን በይዘትዎ አናሠለጥንም።'] }
  ];
  const STEPS = [
    { icon:'edit_note', t:['Add your content','ይዘትዎን ያክሉ'], d:['Paste Amharic or English text, upload a lesson video, or paste a link from YouTube, Drive or your LMS.','የአማርኛ ወይም የእንግሊዝኛ ጽሑፍ ይለጥፉ፣ የትምህርት ቪዲዮ ይጫኑ ወይም ሊንክ ይለጥፉ።'] },
    { icon:'sign_language', t:['We translate to EthSL','ወደ ምልክት ቋንቋ እንተረጉማለን'], d:['Our models follow EthSL grammar, not word-for-word order. Deaf signers test every release.','ሞዴሎቻችን የምልክት ቋንቋ ሰዋስውን ይከተላሉ እንጂ ቃል በቃል አይደለም።'] },
    { icon:'share', t:['Review, publish, share','ይገምግሙ፣ ያትሙ፣ ያጋሩ'], d:['Jump to any sentence, fix it, then embed the player, download MP4 and captions, or share a link.','ወደ ማንኛውም ዓረፍተ ነገር ይዝለሉ፣ ያስተካክሉ፣ ከዚያ ያስገቡ፣ ያውርዱ ወይም ያጋሩ።'] }
  ];
  const USES = [
    { icon:'school', img:['Photo: Deaf students in a classroom','ፎቶ፦ በክፍል ውስጥ ያሉ መስማት የተሳናቸው ተማሪዎች'], t:['Education','ትምህርት'], d:['Sign every lesson in the national curriculum, from grade 1 to university.','ከ1ኛ ክፍል እስከ ዩኒቨርሲቲ እያንዳንዱን ትምህርት በምልክት ያቅርቡ።'], b:[['Works inside Savanna and other LMSs','በሳቫና እና በሌሎች LMS ውስጥ ይሠራል'],['Teacher review before publishing','ከመታተሙ በፊት የመምህር ግምገማ']] },
    { icon:'live_tv', img:['Photo: newsroom studio','ፎቶ፦ የዜና ስቱዲዮ'], t:['Media and broadcast','ሚዲያ እና ስርጭት'], d:['Add a sign window to news, public service announcements and social video.','ለዜና፣ ለሕዝብ ማስታወቂያዎች እና ለማኅበራዊ ቪዲዮ የምልክት መስኮት ያክሉ።'], b:[['Picture-in-picture signer','በምስል-ውስጥ-ምስል ምልክት ሰጪ'],['Burned-in or toggleable','የተቀረጸ ወይም የሚበራ']] },
    { icon:'account_balance', img:['Photo: health clinic reception','ፎቶ፦ የጤና ጣቢያ መቀበያ'], t:['Public services','የሕዝብ አገልግሎቶች'], d:['Clinics, banks and government offices can sign notices, forms and announcements.','ጤና ጣቢያዎች፣ ባንኮች እና የመንግሥት ቢሮዎች ማስታወቂያዎችን እና ቅጾችን በምልክት ማቅረብ ይችላሉ።'], b:[['Kiosk and QR code mode','የኪዮስክ እና የQR ኮድ ሁነታ'],['Visual alerts, never sound alone','የእይታ ማንቂያዎች፣ ድምፅ ብቻ አይደለም']] }
  ];
  const GOALS = [
    { n:'1M', t:['minutes of lessons in EthSL','ደቂቃዎች ትምህርት በምልክት ቋንቋ'] },
    { n:'500', t:['schools and colleges signed up','የተመዘገቡ ትምህርት ቤቶች እና ኮሌጆች'] },
    { n:'40', t:['Deaf signers employed as reviewers','በገምጋሚነት የተቀጠሩ መስማት የተሳናቸው'] },
    { n:'80%', t:['less data than streaming video','ከቪዲዮ ስርጭት ያነሰ ዳታ'] }
  ];
  const VOICES = [
    { q:['I learned photosynthesis in my own language for the first time. I replayed the signs until I understood.','ለመጀመሪያ ጊዜ ፎቶሲንተሲስን በራሴ ቋንቋ ተማርኩ። እስክረዳ ድረስ ምልክቶቹን ደጋግሜ አየሁ።'], n:'Selamawit H.', r:['Grade 10 student, Deaf','የ10ኛ ክፍል ተማሪ፣ መስማት የተሳናት'] },
    { q:['We have two interpreters for 300 students. LE HULUM covers the lessons they cannot reach.','ለ300 ተማሪዎች ሁለት አስተርጓሚዎች አሉን። ለሁሉም ያልደረሱባቸውን ትምህርቶች ይሸፍናል።'], n:'Ato Tesfaye G.', r:['Director, school for the Deaf','ዳይሬክተር፣ የመስማት የተሳናቸው ትምህርት ቤት'] },
    { q:['I review every sign before it goes out. The team changes things when we say a sign is wrong.','ከመውጣቱ በፊት እያንዳንዱን ምልክት እገመግማለሁ። ምልክቱ ስህተት ነው ስንል ቡድኑ ያስተካክላል።'], n:'Meron A.', r:['Deaf EthSL reviewer','መስማት የተሳናት የምልክት ገምጋሚ'] }
  ];
  const PARTNERS = ['ALX · Savanna', 'School partner', 'Media partner', 'NGO partner', 'Ministry partner'];
  const INSTALL = 'curl https://api.lehulum.et/v1/translate \\\n  -H "Authorization: Bearer $LEHULUM_KEY" \\\n  -d \'{"text": "ሰላም፣ ወደ ክፍል እንኳን ደህና መጡ።", "lang": "am", "output": ["avatar", "vtt"]}\'';

  return { THEMES, T, SAMPLE, DEMO, split, gloss, build, SUBJ, LIB, MEMBERS, KEYS, INVOICES, USAGE, ACTIVITY, PLANS, FAQ, STEPS, USES, GOALS, VOICES, PARTNERS, INSTALL };
})();
