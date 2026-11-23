/* Inspire FM · Quran Stories, full versions. Written in our own words.
   Rules: the main story follows the Qur'an (meanings, not word-for-word translation, with references).
   Extra detail only from sahih hadith or mainstream tafsir, and always shown in a labelled box with its source.
   No words are put into a prophet's mouth that are not in the Qur'an or a sahih hadith. Weak stories are named as weak.
   Items in a chapter: "text" = paragraph · ['q', key, meaning] = key ayah (Arabic + recitation) ·
   ['t', source, text] = from tafsir · ['h', source, text] = from hadith · ['?', question, answer] = think first.
   Please have an imam or teacher review before launch. */
window.IFM_STORY_ERAS = [
  ['dawn', 'The first people', 'The children of Adam'],
  ['nuh', 'The age of Nuh', 'The great flood'],
  ['ibrahim', 'The age of Ibrahim', 'Iraq to Makkah'],
  ['yusuf', 'Yusuf and Ayyub', 'The family of Ishaq and Yaqub'],
  ['musa', 'The age of Musa', 'Egypt and the Children of Israel'],
  ['kings', 'The kings of Bani Isra\'il', 'Talut, Dawud and Sulayman'],
  ['later', 'After Sulayman', 'Later prophets and nations'],
  ['isa', 'The age of Isa', 'Maryam and her son'],
  ['before', 'Just before Islam', 'Arabia and Yemen'],
  ['unknown', 'Time not given', 'The Qur\'an keeps it open']
];
window.IFM_STORY_X = {};
(function (X) {

X['habil-qabil'] = {
  era: 'dawn', eraNote: 'The very beginning of humanity, when the earth held one family.',
  place: [], placeNote: 'The Qur\'an doesn\'t say where this happened, and no reliable report fixes the place.',
  who: [['Adam', 'p', 'The first human and first prophet, father of the two brothers'], ['Habil', 'g', 'The brother whose offering was accepted, who refused to strike back'], ['Qabil', 'b', 'The brother who let jealousy turn into murder'], ['The raven', 'a', 'Sent by Allah to show Qabil how to bury the dead']],
  ch: [
    ['Two offerings', [
      'Allah tells the Prophet ﷺ to recite this story "in truth". It is one of the oldest stories there is: a time when the whole of humanity was one family, and the earth had never yet seen a grave.',
      'Two sons of Adam each brought an offering to Allah. One offering was accepted. The other was not.',
      ['q', '5:27', 'Recite to them in truth the story of Adam\'s two sons, when they each offered a sacrifice, and it was accepted from one of them and not from the other.'],
      ['t', 'Ibn Kathir, from reports of Ibn Abbas and Ibn Mas\'ud', 'Early scholars reported that Habil, who kept sheep, offered the best of his flock, while Qabil, who farmed, offered poor produce, and that the quarrel was linked to a marriage. These reports come from the Companions and may draw on earlier scriptures. The Qur\'an itself doesn\'t give the reason, so hold them lightly.']
    ]],
    ['"I will kill you"', [
      'Qabil didn\'t ask what he had done wrong. He didn\'t try again. He turned on his brother: "I will kill you."',
      'Habil\'s answer is one of the calmest replies in the whole Qur\'an. "Allah only accepts from those who are mindful of Him." Then: "If you stretch out your hand to kill me, I will not stretch out mine to kill you. I fear Allah, the Lord of all the worlds." (5:27-28)',
      'He went further, warning his brother where this road ended: Qabil would carry the sin of it and become one of the people of the Fire (5:29).',
      ['?', 'Habil was strong enough to fight back. Why didn\'t he?', 'He tells us himself in the ayah: he feared Allah. He would rather be wronged than become a killer. Scholars note that Islam allows self-defence; what Habil refused was to become the one who kills.']
    ]],
    ['The first killing', [
      'The Qur\'an describes the moment with a single, chilling phrase: Qabil\'s own soul made the killing seem easy to him. It talked him into it, step by step, until it felt possible.',
      'And so he killed his brother, and became one of the losers (5:30). The first death on earth was not from illness or old age. It was jealousy.'
    ]],
    ['The raven', [
      'Then came the silence. A body on the ground, and a brother who had no idea what to do with it. No one had ever been buried before.',
      'Allah sent a raven. It scratched at the earth, digging, to show Qabil how to hide his brother\'s body.',
      ['q', '5:31', 'Then Allah sent a raven scratching the ground, to show him how to hide his brother\'s body. He said, "Woe to me! Couldn\'t I even be like this raven and hide my brother\'s body?" And he became full of regret.'],
      'A bird had to teach a human being what to do. Regret came, but too late to give back what he had taken.'
    ]],
    ['One life, all of humanity', [
      'Straight after the story, Allah gives one of the most famous rulings in the Qur\'an: whoever kills a soul unjustly, it is as if he has killed all of humanity, and whoever saves one life, it is as if he has saved all of humanity (5:32).',
      ['h', 'Sahih al-Bukhari 3335', 'The Prophet ﷺ said that no person is killed unjustly except that the first son of Adam carries a share of that sin, because he was the first to start killing.']
    ]]
  ],
  wow: [['Every unjust killing since adds to Qabil\'s account, because he was the first to do it.', 'Sahih al-Bukhari 3335'], ['The first burial in history was learned from watching a raven.', 'Qur\'an 5:31'], ['Habil\'s words, "Allah only accepts from the mindful", are quoted by scholars as a rule for every good deed.', 'Qur\'an 5:27']],
  src: ['Qur\'an, al-Ma\'idah 5:27-32', 'Sahih al-Bukhari 3335', 'Tafsir Ibn Kathir on 5:27']
};

X['harut-marut'] = {
  era: 'kings', eraNote: 'The Qur\'an places it alongside the reign of Sulayman.',
  place: [['Babylon (Babil), Iraq', 32.54, 44.42, 1]], placeNote: 'Babylon is named in the ayah itself. It is the only time the city is named in the Qur\'an.',
  who: [['Sulayman', 'p', 'The prophet-king falsely accused of using magic'], ['The devils', 'b', 'Spread magic and lied that it came from Sulayman'], ['Harut and Marut', 's', 'Two angels sent down in Babylon as a test'], ['The learners', 'b', 'People who learned harm knowing it had no good in it']],
  ch: [
    ['A lie about a prophet', [
      'Sulayman was given a kingdom like no one before or after him. So when people wanted to make their magic look powerful, they used his name.',
      'The Qur\'an tells us that devils recited lies about Sulayman\'s kingdom, spreading magic and claiming it was his secret. The reply is blunt: Sulayman did not disbelieve. It was the devils who disbelieved, teaching people magic (2:102).',
      ['t', 'Ibn Kathir, from as-Suddi and others', 'Early scholars reported that devils wrote down magic and hid it, then after Sulayman\'s death claimed it was the source of his power. These reports explain the ayah\'s background; the ayah itself is what clears him.']
    ]],
    ['Two angels in Babylon', [
      'Then the Qur\'an turns to Babylon, and to two angels, Harut and Marut, sent down as a test.',
      ['q', '2:102', '…what was sent down to the two angels in Babylon, Harut and Marut. But they never taught anyone without first saying, "We are only a test, so do not disbelieve."'],
      'Think about that warning. Before a single lesson, every learner was told plainly: this is a trial, and taking it means losing your faith. No one could say they weren\'t warned.'
    ]],
    ['What magic can and can\'t do', [
      'Still, people learned from them how to cause division, even between a husband and his wife.',
      'But the Qur\'an puts a hard limit on it: they could not harm anyone except by Allah\'s permission. What they learned harmed them and didn\'t benefit them, and they knew that whoever buys it has no share in the Hereafter. How bad was the price they sold their souls for, if only they knew (2:102).',
      ['?', 'If angels taught it, doesn\'t that make magic acceptable?', 'No. The ayah shows the opposite: each learner was warned that learning it was disbelief. It was a test of who would walk away. The Prophet ﷺ counted magic among the seven great destroying sins (Sahih al-Bukhari 2766).']
    ]],
    ['The story you may have heard', [
      'Many people have heard a longer version: that these two angels fell in love with a beautiful woman called Zuhra, who became the planet Venus.',
      ['t', 'Ibn Kathir', 'Ibn Kathir explained that this tale comes from Isra\'iliyyat, mostly through Ka\'b al-Ahbar, and is not authentically from the Prophet ﷺ. Angels do not disobey Allah (66:6), so we leave it aside.'],
      'What we can be sure of is what Allah tells us in the ayah, and that is more than enough.'
    ]],
    ['Real protection', [
      'The lesson isn\'t fear. Nothing touches you except by Allah\'s permission, and He has given simple protection.',
      ['h', 'Sahih al-Bukhari 2311', 'The Prophet ﷺ confirmed that whoever recites Ayat al-Kursi when going to bed has a guardian from Allah, and no devil comes near him until morning.'],
      'Add the last two surahs, al-Falaq and an-Nas, morning and evening. No charms, no fortune tellers. Just Allah.'
    ]]
  ],
  wow: [['Babylon appears by name only once in the entire Qur\'an, in this ayah.', 'Qur\'an 2:102'], ['Magic is listed among the seven destroying sins.', 'Sahih al-Bukhari 2766'], ['The popular Zuhra / Venus tale is Isra\'iliyyat, not from the Prophet ﷺ.', 'Tafsir Ibn Kathir on 2:102']],
  src: ['Qur\'an, al-Baqarah 2:101-103', 'Sahih al-Bukhari 2766, 2311', 'Tafsir Ibn Kathir on 2:102']
};

X['town'] = {
  era: 'unknown', eraNote: 'The Qur\'an doesn\'t say when. Some early scholars linked it to messengers sent in the time of Isa; Ibn Kathir doubted this.',
  place: [['Antioch (Antakya), Turkey', 36.2, 36.16, 0]], placeNote: 'Antioch is one opinion from early scholars. The Qur\'an only says "a town".',
  who: [['The three messengers', 'p', 'Sent to the town, one after another'], ['The townspeople', 'b', 'Mocked, threatened and finally killed the believer'], ['The man who came running', 'g', 'An ordinary man who spoke the truth. Named Habib in some tafsir reports']],
  ch: [
    ['Two messengers, then a third', [
      'Allah tells the Prophet ﷺ to give the people an example: the people of a town, when the messengers came to them (36:13).',
      'First Allah sent two. The people called them liars. So He strengthened them with a third, and together they said, "We have been sent to you" (36:14).'
    ]],
    ['"You\'re just like us"', [
      'The people\'s answer is the same one prophets heard again and again: "You are only human like us. The Most Merciful hasn\'t sent anything down. You are only lying" (36:15).',
      'The messengers didn\'t argue back with anger. They said: "Our Lord knows we have been sent to you. Our only duty is to deliver the message clearly" (36:16-17).'
    ]],
    ['A bad omen', [
      'The mood turned dark. "We see you as a bad omen," the people said. "If you don\'t stop, we will stone you, and you will suffer a painful punishment from us" (36:18).',
      'The messengers replied: "Your bad omen is with yourselves. Is it because you are being reminded? No, you are a people going too far" (36:19).'
    ]],
    ['From the far end of the city', [
      'Then, from the farthest edge of the city, a man came running.',
      ['q', '36:20', 'And a man came running from the farthest end of the city. He said, "My people, follow the messengers."'],
      'He had no title and no army. Only words: "Follow those who ask you for no payment and are rightly guided. Why should I not worship the One who created me, and to whom you will all be returned? Shall I take gods besides Him? If the Most Merciful wanted to harm me, their intercession wouldn\'t help me at all. I would be clearly lost. I believe in your Lord, so listen to me" (36:21-25).',
      ['t', 'Ibn Kathir, from Ibn Ishaq and others', 'Early reports name him Habib, and some say he was a carpenter. The Qur\'an leaves him unnamed and remembers him only for what he did.'],
      ['?', 'Everyone else stayed quiet. What gave this man the courage to speak?', 'Listen to his reasons in the ayat: the messengers asked for nothing, they were guided, he would return to his Creator, and false gods could not save him. Once those things were clear to him, silence wasn\'t an option.']
    ]],
    ['"If only my people knew"', [
      'The people killed him. The Qur\'an doesn\'t describe how; it moves straight to what happened next.',
      ['q', '36:26', 'It was said, "Enter Paradise." He said, "If only my people knew how my Lord has forgiven me and made me one of the honoured."'],
      'In Paradise, his first thought was still his people. Not revenge. Not "I told you so". Only: if only they knew.',
      ['t', 'Ibn Kathir, from Ibn Abbas', 'Ibn Abbas said this man gave his people sincere advice twice: once in life, telling them to follow the messengers, and once after death, wishing they knew.'],
      'For the town, there was no army sent. Only a single cry, and they were silenced (36:28-29).'
    ]]
  ],
  wow: [['The man is never named in the Qur\'an. He is remembered only for one act of courage.', 'Qur\'an 36:20'], ['He wished his killers well even after entering Paradise.', 'Qur\'an 36:26-27']],
  src: ['Qur\'an, Ya-Sin 36:13-29', 'Tafsir Ibn Kathir on 36:13-29']
};

X['heifer'] = {
  era: 'musa', eraNote: 'In the time of Musa, among the Children of Israel.',
  place: [], placeNote: 'The Qur\'an doesn\'t say where. It happened while Musa was with the Children of Israel after leaving Egypt.',
  who: [['Musa', 'p', 'Passed on Allah\'s command'], ['The murdered man', 'g', 'Brought back to life to name his killer'], ['The killer', 'b', 'Hid his crime, until Allah exposed it'], ['The Children of Israel', 'b', 'Turned a simple command into a long list of questions']],
  ch: [
    ['A body and no witness', [
      'A man had been killed, and no one would admit to it. Each side blamed the other. The Qur\'an says they argued over it, but Allah was going to bring out what they were hiding (2:72).',
      ['t', 'Ibn Kathir, from Ubaydah as-Salmani and Abu al-Aliyah', 'Early scholars reported that the victim was a wealthy man, killed by a relative who wanted his inheritance and then left the body at another village\'s door. These are reports from the early generations, not the Qur\'an.']
    ]],
    ['"Slaughter a cow"', [
      'Musa came with Allah\'s answer: "Allah commands you to slaughter a cow."',
      'The reply was almost insulting: "Are you making fun of us?" Musa said, "I seek refuge in Allah from being one of the ignorant" (2:67). A prophet doesn\'t joke about Allah\'s commands.'
    ]],
    ['Question after question', [
      'Any cow would have done. But instead of obeying, they started asking.',
      '"Ask your Lord to tell us what it is." Neither old nor young, in between. So do what you are commanded (2:68).',
      '"What colour?" Bright yellow, pleasing to look at (2:69).',
      '"All cows look alike to us. Tell us more." Not trained to plough or water the fields, sound, with no other colour on it (2:70-71).',
      ['?', 'What would have happened if they had slaughtered any cow on day one?', 'Ibn Abbas said that if they had slaughtered any cow at all, it would have been enough. They made it hard for themselves, so it was made hard for them (reported in Tafsir Ibn Kathir).'],
      'Finally they said, "Now you have brought the truth," and they slaughtered it. The Qur\'an adds one quiet, cutting line: they almost didn\'t (2:71).'
    ]],
    ['The dead man speaks', [
      'Then Allah told them to strike the dead man with part of the cow.',
      ['q', '2:73', 'So We said, "Strike him with part of it." This is how Allah brings the dead to life, and shows you His signs so that you may understand.'],
      ['t', 'Tafsir Ibn Kathir', 'The scholars of tafsir explain that the man rose, named the one who had killed him, and then died again.'],
      'A secret that would have stayed buried forever was told by the victim himself.'
    ]],
    ['Harder than stone', [
      'And after all of that, Allah says their hearts became hard, like stone or even harder. Because some stones split and rivers gush out of them, some crack open and water comes out, and some fall down in awe of Allah (2:74).',
      'Even rock can soften. The question the story leaves us with: can our hearts?'
    ]]
  ],
  wow: [['Al-Baqarah, the longest surah in the Qur\'an, is named after this cow.', 'Qur\'an 2:67-73'], ['The Prophet ﷺ said Shaytan runs from a house where Surah al-Baqarah is recited.', 'Sahih Muslim 780'], ['Had they slaughtered any cow straight away, it would have been enough.', 'Ibn Abbas, in Tafsir Ibn Kathir']],
  src: ['Qur\'an, al-Baqarah 2:67-74', 'Sahih Muslim 780', 'Tafsir Ibn Kathir on 2:67-73']
};

X['khidr'] = {
  era: 'musa', eraNote: 'In the life of Musa.',
  place: [], placeNote: '"Where the two seas meet" (18:60). Scholars gave different places; the Qur\'an and hadith don\'t fix it.',
  who: [['Musa', 'p', 'The great prophet who set out to learn'], ['Yusha\' ibn Nun', 'g', 'Musa\'s young companion on the journey, named in Sahih al-Bukhari'], ['Al-Khidr', 'g', 'A servant of Allah given knowledge from Him. Many scholars say he was a prophet'], ['The fish', 'a', 'The sign that marked the meeting place'], ['The two orphans', 'g', 'Whose treasure was protected for their righteous father\'s sake']],
  ch: [
    ['"Who knows the most?"', [
      ['h', 'Sahih al-Bukhari 4725', 'The Prophet ﷺ told us that Musa once stood to address the Children of Israel and was asked who was the most knowledgeable person. He said, "I am." Allah corrected him for not leaving knowledge to Allah, and told him there was a servant at the meeting of the two seas who knew more than him.'],
      'Musa asked how to find him. He was told to carry a fish in a basket: wherever he lost the fish, that was the place.',
      'So he set off with his young companion, saying he would not stop until he reached the meeting of the two seas, even if he had to travel for years (18:60).'
    ]],
    ['The fish that swam away', [
      'They rested by a rock. While they slept, the fish slipped out and made its way into the sea, and the water stayed open over its path like a tunnel (18:61; Sahih al-Bukhari 4725).',
      'The young man saw it, but forgot to mention it. They walked on. The next day Musa said, "Bring our lunch. We have really felt tired on this journey."',
      ['h', 'Sahih al-Bukhari 4725', 'The Prophet ﷺ pointed out that Musa felt no tiredness until he had passed the place he had been told to reach.'],
      'The boy remembered: "When we rested at the rock, I forgot the fish. Only Shaytan made me forget to mention it" (18:63). Musa said, "That is what we were looking for," and they went back, following their own footsteps (18:64).'
    ]],
    ['The meeting', [
      'There they found one of Allah\'s servants, given mercy from Allah and taught knowledge from Him (18:65).',
      ['q', '18:66', 'Musa said to him, "May I follow you so that you can teach me some of the right guidance you have been taught?"'],
      'The answer was a warning: "You will not be able to be patient with me. How can you be patient with something you don\'t fully understand?" Musa promised: "You will find me patient, if Allah wills, and I won\'t disobey you." The one condition: "Don\'t ask me about anything until I tell you myself" (18:67-70).'
    ]],
    ['The boat', [
      ['h', 'Sahih al-Bukhari 4725', 'A boat\'s crew recognised al-Khidr and carried them for free. Then a small bird landed on the edge of the boat and dipped its beak in the sea. Al-Khidr said: "My knowledge and yours, compared to Allah\'s knowledge, is no more than what this bird took from the sea."'],
      'Then al-Khidr pulled out a plank and made a hole in the boat. Musa couldn\'t hold back: "Did you make a hole to drown its people? You have done something terrible!" "Didn\'t I tell you that you couldn\'t be patient with me?" "Don\'t blame me for forgetting" (18:71-73).',
      ['h', 'Sahih al-Bukhari 4725', 'The Prophet ﷺ said Musa\'s first question was out of forgetfulness.']
    ]],
    ['The boy and the wall', [
      'They walked on until they met a boy, and al-Khidr killed him. Musa was horrified: "You killed an innocent soul who had killed no one? You have done something awful!" "Didn\'t I tell you?" "If I ask you about anything after this, don\'t keep me with you" (18:74-76).',
      'They reached a town and asked its people for food. The people refused to host them. There they found a wall about to fall down, and al-Khidr set it straight. Musa said, "If you wanted, you could have taken payment for that." "This is where we part," said al-Khidr. "But I will tell you the meaning of what you could not be patient with" (18:77-78).',
      ['?', 'Before you read on: why would anyone damage a poor man\'s boat, take a life, and work for free for people who refused them food?', 'Hold your guess, then read the next chapter. That gap between what we see and what Allah knows is the whole point of the story.']
    ]],
    ['The meaning', [
      'The boat belonged to poor people who worked at sea. Ahead of them was a king who was seizing every good boat by force. A damaged boat would be left alone (18:79).',
      'The boy\'s parents were believers, and he would have pushed them into rebellion and disbelief. Allah would give them in his place a child who was purer and kinder (18:80-81).',
      'The wall belonged to two orphan boys in the town. Under it was treasure meant for them, and their father had been a righteous man. Allah wanted them to grow up and take out their treasure themselves (18:82).',
      ['q', '18:82', '…as a mercy from your Lord. I did not do it on my own. That is the meaning of what you could not be patient with.'],
      ['t', 'Scholars of tafsir', 'Scholars agree al-Khidr acted by direct command from Allah ("I did not do it on my own"). No one today can act on hidden knowledge like this. The lesson is trust in Allah\'s wisdom, not taking the law into our own hands.'],
      ['h', 'Sahih al-Bukhari 4725', 'The Prophet ﷺ said: "May Allah have mercy on Musa. We wish he had been patient, so that more of their story would have been told to us."']
    ]]
  ],
  wow: [['All human knowledge next to Allah\'s is like one beakful from the sea.', 'Sahih al-Bukhari 4725'], ['He was called al-Khidr, "the green one", because he sat on bare ground and it turned green beneath him.', 'Sahih al-Bukhari 3402'], ['Musa only felt tired once he had walked past the meeting place.', 'Sahih al-Bukhari 4725']],
  src: ['Qur\'an, al-Kahf 18:60-82', 'Sahih al-Bukhari 4725, 3402', 'Tafsir Ibn Kathir on 18:60-82']
};

X['qarun'] = {
  era: 'musa', eraNote: 'In the time of Musa and Pharaoh.',
  place: [['Egypt', 30.0, 31.2, 0]], placeNote: 'The Qur\'an names Qarun alongside Pharaoh and Haman (29:39, 40:24), so he lived in Egypt in Musa\'s time.',
  who: [['Qarun', 'b', 'From Musa\'s own people, given huge wealth, destroyed by arrogance'], ['Musa', 'p', 'The prophet Qarun turned against'], ['The advisers', 'g', 'People of his community who warned him kindly'], ['Those who wanted his life', 'b', 'Envied him, until they saw his end'], ['Those given knowledge', 'g', 'Knew that Allah\'s reward is better']],
  ch: [
    ['Keys too heavy to carry', [
      'Qarun was one of Musa\'s own people. That makes his story sharper: he wasn\'t a foreign king. He was from the oppressed community that Allah saved.',
      'Allah gave him treasure on a scale hard to imagine. The keys alone were a heavy load for a group of strong men (28:76).',
      ['t', 'Ibn Kathir, from Ibn Abbas and others', 'Early scholars reported that Qarun was a close relative of Musa, some say his cousin.'],
      'And yet the Qur\'an says he oppressed them. The man who should have helped his people turned on them, and later stood with Pharaoh and Haman against Musa (40:23-24).'
    ]],
    ['Five pieces of advice', [
      'His people gave him some of the best advice in the Qur\'an (28:76-77):',
      '"Don\'t be arrogant. Allah doesn\'t love the arrogant." "Seek the home of the Hereafter with what Allah has given you." "Don\'t forget your share of this world." "Do good, as Allah has done good to you." "Don\'t seek corruption on the earth."',
      'Notice: they didn\'t tell him to give it all away. They told him to enjoy it, and use it well.'
    ]],
    ['"I earned this myself"', [
      'Qarun\'s answer is the root of everything that follows.',
      ['q', '28:78', 'He said, "I was only given it because of knowledge I have." Didn\'t he know that Allah had destroyed generations before him who were stronger than him and had gathered more?']
    ]],
    ['The parade', [
      'One day Qarun went out to his people in all his finery. The crowd split into two.',
      'Those who wanted this world said: "If only we had what Qarun has been given! He is truly very lucky" (28:79).',
      'Those who had been given knowledge said: "Shame on you! Allah\'s reward is better for whoever believes and does good. And only the patient will receive it" (28:80).',
      ['?', 'Be honest: standing in that crowd, which side would you have been on?', 'The Qur\'an doesn\'t blame people for noticing wealth. It shows the difference between wanting it more than anything, and knowing something better is coming.']
    ]],
    ['Swallowed', [
      ['q', '28:81', 'So We caused the earth to swallow him and his home. He had no group to help him against Allah, and he could not help himself.'],
      'The next morning, the same people who had wished to be him were saying: "Allah gives generously to whoever He wills and holds back from whoever He wills. If Allah had not been kind to us, He would have made the earth swallow us too" (28:82).',
      'One night was all it took for envy to turn into relief.'
    ]],
    ['Who the Hereafter is for', [
      'The very next ayah sums up the whole story: that home of the Hereafter is for those who don\'t want to be high and mighty on earth or spread corruption. And the best end is for the mindful (28:83).'
    ]]
  ],
  wow: [['Just the keys to his treasure were too heavy for a group of strong men.', 'Qur\'an 28:76'], ['He wasn\'t a foreigner: he came from Musa\'s own oppressed people.', 'Qur\'an 28:76'], ['The Prophet ﷺ warned of a man who walked in pride and was swallowed by the earth.', 'Sahih al-Bukhari 3485']],
  src: ['Qur\'an, al-Qasas 28:76-83; al-\'Ankabut 29:39; Ghafir 40:23-24', 'Sahih al-Bukhari 3485', 'Tafsir Ibn Kathir on 28:76']
};

})(window.IFM_STORY_X);
(function (X) {

X['bilqis'] = {
  era: 'kings', eraNote: 'In the reign of Sulayman, son of Dawud.',
  place: [['Jerusalem, Sulayman\'s kingdom', 31.78, 35.23, 0], ['Saba\', Yemen (the queen\'s land)', 15.42, 45.33, 1]], placeNote: 'Saba\' is named in the Qur\'an (27:22). Sulayman\'s seat is placed in Jerusalem by historians and tafsir.',
  who: [['Sulayman', 'p', 'Prophet and king, taught the speech of birds'], ['The hoopoe', 'a', 'The bird that brought the news'], ['The ant', 'a', 'Warned her colony, and made Sulayman smile'], ['The Queen of Saba\'', 'r', 'A wise ruler. Named Bilqis in tafsir'], ['An \'ifrit of the jinn', 's', 'Offered to bring the throne before Sulayman stood up'], ['One with knowledge of the Book', 'g', 'Brought the throne in the blink of an eye']],
  ch: [
    ['The king who heard an ant', [
      'Sulayman inherited from his father Dawud, and said: "People, we have been taught the speech of birds and given something of everything. This is clear favour" (27:16).',
      'One day his army of jinn, people and birds marched in ranks and reached a valley of ants. A single ant called out: "Ants, get into your homes, so Sulayman and his soldiers don\'t crush you without realising" (27:17-18).',
      'Sulayman heard it, and smiled, laughing at her words. Then he turned to Allah:',
      ['q', '27:19', 'My Lord, inspire me to be grateful for Your favour on me and on my parents, and to do good that pleases You, and admit me by Your mercy among Your righteous servants.']
    ]],
    ['"Where is the hoopoe?"', [
      'Reviewing the birds, Sulayman noticed one missing. "Why don\'t I see the hoopoe? Or is it absent?" He was serious: unless it came back with a clear reason, it would be punished (27:20-21).',
      'It wasn\'t gone long. And it came back with words no small bird would normally dare say to a king: "I have learned something you haven\'t" (27:22).'
    ]],
    ['News from Saba\'', [
      '"I have come to you from Saba\' with sure news. I found a woman ruling them. She has been given something of everything, and she has a magnificent throne" (27:22-23).',
      'Then the part that troubled the hoopoe most: "I found her and her people bowing to the sun instead of Allah. Shaytan has made their deeds look good to them, and blocked them from the way" (27:24). Even a bird knew who deserves worship.'
    ]],
    ['The letter', [
      'Sulayman didn\'t take the news on trust. "We will see whether you have told the truth or are one of the liars. Take this letter of mine, drop it to them, then step back and see how they respond" (27:27-28).',
      ['q', '27:30', 'It is from Sulayman, and it is: "In the name of Allah, the Most Gracious, the Most Merciful."'],
      'The queen called her council: "A noble letter has been delivered to me." It said: "Don\'t be arrogant towards me, and come to me in submission" (27:29-31).'
    ]],
    ['The queen\'s council', [
      'Her advisers were ready to fight: "We have strength and great might, but the decision is yours" (27:33).',
      'She chose wisdom over pride: "When kings enter a town, they ruin it and humiliate its most honoured people. I will send them a gift and see what my messengers bring back" (27:34-35).',
      ['?', 'She had an army. Why send a gift instead?', 'She had just explained what war does to a land. Scholars of tafsir add that she was testing him: a king would want wealth; a prophet would want something else (Tafsir Ibn Kathir).'],
      'Sulayman sent the gift back: "What Allah has given me is better than what He has given you. It is you who rejoice in your gift" (27:36).'
    ]],
    ['The throne', [
      'Sulayman asked his court: "Which of you can bring me her throne before they come to me in submission?" (27:38).',
      'An \'ifrit of the jinn said: "I will bring it before you rise from your seat" (27:39). Then one who had knowledge from the Book said: "I will bring it to you before your eye blinks" (27:40).',
      'And there it was, standing in front of him.',
      ['q', '27:40', 'This is from the favour of my Lord, to test me whether I will be grateful or ungrateful.'],
      ['t', 'Tafsir Ibn Kathir', 'Many early scholars named the man with knowledge of the Book as Asif ibn Barkhiya, a righteous scholar in Sulayman\'s court. Allah knows best.'],
      'A throne carried across a desert in less than a blink, and Sulayman\'s first thought was: this is a test of gratitude.'
    ]],
    ['The floor of glass', [
      'Sulayman had the throne disguised. When the queen arrived she was asked, "Is your throne like this?" She answered carefully: "It is as though it were the same" (27:41-42).',
      'Then she was invited into the palace. She saw the floor and thought it was deep water, and lifted her dress from her ankles. Sulayman said: "It is a palace made smooth with glass" (27:44).',
      ['q', '27:44', 'She said, "My Lord, I have wronged myself, and I submit, with Sulayman, to Allah, the Lord of all the worlds."'],
      'Notice her words: not "to Sulayman", but "with Sulayman, to Allah". Side by side, as equals before their Lord.',
      ['t', 'Tafsir', 'Her name, Bilqis, comes from tafsir and history. The Qur\'an only calls her the woman who ruled Saba\'.']
    ]]
  ],
  wow: [['An ant\'s warning made a prophet laugh, and turned into one of the Qur\'an\'s most loved duas.', 'Qur\'an 27:18-19'], ['A bird told a prophet-king: "I know something you don\'t."', 'Qur\'an 27:22'], ['When Sulayman died, the jinn only realised when a termite ate through the staff he was leaning on.', 'Qur\'an 34:14']],
  src: ['Qur\'an, an-Naml 27:15-44; Saba\' 34:14', 'Tafsir Ibn Kathir on 27:20-44']
};

X['saba'] = {
  era: 'later', eraNote: 'The Qur\'an tells it straight after Dawud and Sulayman in Surah Saba\'; it gives no date.',
  place: [['The dam of Ma\'rib, Yemen', 15.40, 45.27, 1]], placeNote: 'Saba\' was in Yemen. The ruins of the great dam of Ma\'rib still stand today.',
  who: [['The people of Saba\'', 'b', 'Given gardens and safe roads, and turned away'], ['A few believers', 'g', 'The group Iblis could not mislead (34:20)'], ['Iblis', 'b', 'Found that his guess about them came true']],
  ch: [
    ['A sign in their homeland', [
      'In their own homes, the people of Saba\' had a sign: two gardens, one on the right and one on the left (34:15).',
      'And they were told: "Eat from what your Lord provides, and thank Him. A good land, and a forgiving Lord."',
      ['t', 'Tafsir Ibn Kathir', 'Scholars of tafsir describe a great dam that held back the water running between two mountains, watering the land so richly that it turned green on both sides of the valley.'],
      'A good land and a forgiving Lord. It is hard to think of a better offer.'
    ]],
    ['They turned away', [
      ['q', '34:16', 'But they turned away, so We sent against them the flood of the dam, and replaced their two gardens with gardens of bitter fruit, tamarisk and a few lote trees.'],
      'Ripe fruit became bitter shrubs. The Qur\'an asks: "Do We punish anyone except the ungrateful?" (34:17).'
    ]],
    ['Roads that were too easy', [
      'There was more. Allah had placed towns between them and the blessed lands, close enough to see, and made the journeys measured: "Travel between them by night and day, safely" (34:18).',
      'They answered: "Our Lord, make the distances between our journeys longer" (34:19). They wronged themselves, so Allah made them into stories people tell, and scattered them completely.',
      ['?', 'Why would anyone ask for their journeys to be made longer?', 'The ayah says they wronged themselves. Scholars of tafsir explain they grew bored of comfort, the way some of the Children of Israel grew tired of manna and asked for onions instead (Tafsir Ibn Kathir).'],
      ['t', 'Tafsir Ibn Kathir', 'The Arabs turned their scattering into a saying. When a group breaks apart for good, they say: "They scattered like the people of Saba\'."']
    ]],
    ['Who was Saba\'?', [
      ['h', 'Jami\' at-Tirmidhi 3222 (hasan)', 'A man asked the Prophet ﷺ whether Saba\' was a land or a woman. He said it was neither: Saba\' was a man with ten sons. Six settled in Yemen and four moved north towards Sham, and the Arab tribes came from them.'],
      'So when the gardens failed, the family of Saba\' spread across Arabia, carrying the memory of what they had lost.'
    ]],
    ['The guess that came true', [
      'The story ends with a warning. Iblis had made a guess about these people, and they proved him right: they followed him, except a group of believers (34:20).',
      'He had no real power over them. It was a test, to show who truly believed in the Hereafter (34:21). That is the same test we live in now.',
      'Allah says: "In this there are signs for everyone who is patient and grateful" (34:19).'
    ]]
  ],
  wow: [['The Prophet ﷺ explained that Saba\' was a man with ten sons, the root of many Arab tribes.', 'Jami\' at-Tirmidhi 3222'], ['"Scattered like Saba\'" became an Arabic saying for a group that breaks up for good.', 'Tafsir Ibn Kathir'], ['The remains of the great dam of Ma\'rib can still be seen in Yemen.', 'Historical']],
  src: ['Qur\'an, Saba\' 34:15-21', 'Jami\' at-Tirmidhi 3222 (graded hasan)', 'Tafsir Ibn Kathir on 34:15-19']
};

X['hundred-years'] = {
  era: 'later', eraNote: 'Many scholars of tafsir place it after Jerusalem was destroyed by the Babylonians.',
  place: [['Jerusalem (Bayt al-Maqdis)', 31.78, 35.23, 0]], placeNote: 'The Qur\'an says "a town". Many mufassirun said it was Jerusalem after its destruction.',
  who: [['The traveller', 'g', 'A man who wondered how Allah would revive a dead town. Many tafsir name him \'Uzayr'], ['His donkey', 'a', 'Turned to bones, then raised before his eyes']],
  ch: [
    ['A town fallen on its roofs', [
      'A man passed by a town lying in ruins, its walls collapsed onto their own roofs (2:259). No voices. No people. Only stone.',
      'He looked at it and wondered aloud: "How will Allah bring this back to life after its death?"',
      ['t', 'Tafsir Ibn Kathir', 'The best-known view among the early scholars is that the man was \'Uzayr and the town was Jerusalem, after it had been destroyed. Others named another righteous man. The Qur\'an doesn\'t say, and the lesson doesn\'t depend on it.']
    ]],
    ['A hundred years', [
      'Allah answered his question in the most direct way possible. He caused the man to die, for a hundred years. Then He brought him back (2:259).',
      '"How long have you stayed here?" The man looked around: "A day, or part of a day."',
      '"No. You have stayed a hundred years."'
    ]],
    ['Look', [
      ['q', '2:259', 'Look at your food and drink: it has not changed. And look at your donkey… and look at the bones, how We raise them and then clothe them with flesh.'],
      'His food was fresh. His drink hadn\'t spoiled. The Arabic word used means it had not aged with the years at all.',
      'And next to it, his donkey: nothing left but bones. Then, as he watched, the bones came together and were covered with flesh.',
      ['t', 'Tafsir', 'Some scholars of tafsir mention that his food was figs and his drink was grape juice. The Qur\'an only says "food and drink".'],
      ['?', 'Why show him fresh food AND a donkey turned to bones, side by side?', 'Think about what each one proves. One shows Allah can hold a thing exactly as it was for a hundred years. The other shows He can rebuild what has completely decayed. Together they answer his question twice over.']
    ]],
    ['"Now I know"', [
      'When it became clear to him, he said: "I know that Allah has power over all things" (2:259).',
      'Allah also says: "We will make you a sign for people." A man returning a century later, younger than the children he had left behind, was himself the proof.'
    ]],
    ['Three signs in a row', [
      'This story sits between two others about Ibrahim. Just before it, Ibrahim tells a king: "My Lord gives life and causes death" (2:258). Just after, Ibrahim asks Allah to show him how He gives life to the dead, and is shown four birds brought back (2:260).',
      'Three ayat, back to back, all answering the same question: can Allah bring the dead back to life? Yes.'
    ]]
  ],
  wow: [['The word for "unchanged" (yatasannah) comes from sanah, "a year": his food hadn\'t aged a single year.', 'Qur\'an 2:259'], ['Ayat 2:258, 2:259 and 2:260 are three stories in a row about life after death.', 'Qur\'an 2:258-260']],
  src: ['Qur\'an, al-Baqarah 2:258-260', 'Tafsir Ibn Kathir on 2:259']
};

X['dhul-qarnayn'] = {
  era: 'unknown', eraNote: 'The Qur\'an doesn\'t say when he lived. Ibn Kathir said he was not Alexander of Macedon; some modern scholars suggest Cyrus. Allah knows best.',
  place: [], placeNote: 'His journeys went west, east, and to a place between two mountains. The Qur\'an names none of them.',
  who: [['Dhul-Qarnayn', 'r', 'A righteous ruler given power and means across the earth'], ['The people of the west', 'b', 'Judged with justice'], ['The people of the east', 'g', 'With no shelter from the sun'], ['The people between two mountains', 'g', 'Asked for protection'], ['Ya\'juj and Ma\'juj', 'b', 'Gog and Magog, who spread corruption']],
  ch: [
    ['A question from Makkah', [
      'Allah tells the Prophet ﷺ: "They ask you about Dhul-Qarnayn. Say: I will recite to you something about him" (18:83).',
      ['t', 'Seerah of Ibn Ishaq, in Tafsir Ibn Kathir', 'Quraysh sent men to the rabbis of Madinah for questions to test the Prophet ﷺ. They were told to ask about some young men who disappeared long ago, a man who travelled to the ends of the earth, and the soul. Surah al-Kahf answered.']
    ]],
    ['Where the sun sets', [
      'Allah gave him power on earth and the means to reach anything (18:84). He followed a path until he reached the setting of the sun, and found it, to his eyes, setting into a dark, muddy spring (18:86).',
      ['t', 'Tafsir Ibn Kathir', 'Scholars explain this describes what he saw: standing at the edge of the land, the sun appeared to sink into the water, as it does to anyone watching a sunset over the sea.'],
      'There he found a people, and was given a choice: punish them, or treat them well. His answer is a model of justice: whoever does wrong will be punished, then face Allah; whoever believes and does good will have the best reward, and an easy command from us (18:87-88).'
    ]],
    ['Where the sun rises', [
      'Then he followed another path to the rising of the sun, and found people who had no shelter from it (18:90). Allah knew everything he had with him.'
    ]],
    ['Between two mountains', [
      'Then another path, until he came between two mountains, and found a people who could barely understand speech (18:93).',
      'They pleaded: "Dhul-Qarnayn, Ya\'juj and Ma\'juj are spreading corruption in the land. Can we pay you to build a barrier between us and them?" (18:94).',
      ['?', 'They offered him money. What did he ask for instead?', 'Their help. "What my Lord has given me is better. Just help me with your strength" (18:95). He wouldn\'t take payment, but he made them part of the work.']
    ]],
    ['Iron and copper', [
      ['q', '18:95', 'He said, "What my Lord has established me in is better. So help me with strength, and I will build a strong barrier between you and them."'],
      '"Bring me blocks of iron." He filled the gap between the two cliffs. "Blow." When the iron glowed like fire: "Bring me molten copper to pour over it" (18:96).',
      'They could not climb over it, and they could not dig through it (18:97).'
    ]],
    ['Until the promise', [
      'A lesser ruler would have boasted. He said: "This is a mercy from my Lord. When my Lord\'s promise comes, He will flatten it. And my Lord\'s promise is true" (18:98).',
      ['h', 'Sahih al-Bukhari 3346', 'The Prophet ﷺ once woke up alarmed and said a hole had been opened in the barrier of Ya\'juj and Ma\'juj, making a circle with his thumb and finger. Zaynab asked: "Will we be destroyed while there are righteous people among us?" He said: "Yes, if evil becomes widespread."']
    ]]
  ],
  wow: [['The Prophet ﷺ showed the size of the hole in the barrier by making a circle with his fingers.', 'Sahih al-Bukhari 3346'], ['He refused payment and asked for people\'s labour instead.', 'Qur\'an 18:95'], ['"Dhul-Qarnayn" means "the one with two horns". Scholars differ on why he was called this.', 'Tafsir Ibn Kathir']],
  src: ['Qur\'an, al-Kahf 18:83-98', 'Sahih al-Bukhari 3346', 'Tafsir Ibn Kathir on 18:83-98']
};

X['cave'] = {
  era: 'unknown', eraNote: 'Scholars differ: many said after Isa, while Ibn Kathir thought it was earlier. The Qur\'an doesn\'t say.',
  place: [['Ephesus, Turkey (one view)', 37.94, 27.34, 0], ['Near Amman, Jordan (another view)', 31.99, 35.95, 0]], placeNote: 'Several places claim the cave. The Qur\'an doesn\'t name it.',
  who: [['The young men', 'g', 'Believers who left everything for their faith'], ['Their dog', 'a', 'Lay at the entrance with its paws stretched out'], ['Their people', 'b', 'Worshipped others besides Allah'], ['The later townspeople', 'g', 'Discovered them, and learned the promise is true']],
  ch: [
    ['A wonder?', [
      'Allah opens the story with a question: "Do you think the people of the cave and the inscription were the most amazing of Our signs?" (18:9). Amazing as it is, there are greater signs all around us.',
      'Young men took refuge in a cave, and their first words there were a dua.',
      ['q', '18:10', 'Our Lord, give us mercy from Yourself, and set our affair right for us.']
    ]],
    ['Young men who stood up', [
      'They were young men who believed in their Lord, and Allah increased them in guidance (18:13).',
      'He strengthened their hearts when they stood up and said: "Our Lord is the Lord of the heavens and the earth. We will never call on any god besides Him" (18:14).',
      'Their people had taken other gods without any proof. So the young men decided: "Since you have left them, go to the cave. Your Lord will spread His mercy over you" (18:16).'
    ]],
    ['The long sleep', [
      'You would have seen the sun, when it rose, leaning away from their cave to the right, and when it set, passing them on the left, while they lay in the open space inside (18:17).',
      'You would have thought them awake, though they were asleep. Allah turned them over to the right and the left. And their dog stretched its front legs at the entrance. If you had looked at them, you would have turned and run, filled with fear (18:18).'
    ]],
    ['One coin, one trip', [
      'Then Allah woke them. "How long have you stayed?" "A day, or part of a day." "Your Lord knows best" (18:19).',
      'They were hungry. "Send one of you to the city with this silver coin. Let him find the purest food and bring some. And let him be careful: no one must know about you. If they find you, they will stone you or force you back into their religion" (18:19-20).',
      'He walked into a city he no longer recognised, holding money that was centuries old.'
    ]],
    ['Found', [
      'Allah let them be discovered, so people would know His promise is true and the Hour is coming (18:21).',
      'People then argued about them. Those who won the argument said: "We will build a place of worship over them."',
      ['t', 'Tafsir Ibn Kathir', 'Scholars point out that the ayah reports what those people said; it doesn\'t approve it. The Prophet ﷺ warned against taking graves as places of worship (Sahih al-Bukhari 435).']
    ]],
    ['How many were they?', [
      'Some say three, the fourth their dog. Some say five, the sixth their dog, guessing at the unseen. Some say seven, the eighth their dog. Say: "My Lord knows their number best." Only a few know (18:22).',
      ['t', 'Tafsir Ibn Kathir, from Ibn Abbas', 'Ibn Abbas said: "I am one of the few. They were seven." Notice the Qur\'an calls the first two numbers guesses, but not the third.'],
      ['?', 'Why doesn\'t the Qur\'an simply settle the number?', 'The ayah tells you: don\'t argue about it except lightly. The number isn\'t the lesson. Courage, faith, and trust in Allah are.']
    ]],
    ['Three hundred years, and nine', [
      'Then a lesson tucked inside: never say "I will do it tomorrow" without "if Allah wills" (18:23-24).',
      ['t', 'Seerah of Ibn Ishaq', 'When Quraysh asked these questions, the Prophet ﷺ said he would answer the next day without saying "in sha Allah", and the revelation was delayed for days.'],
      'Finally: they stayed in their cave three hundred years, and added nine (18:25). Say: Allah knows best how long they stayed.',
      ['t', 'Tafsir Ibn Kathir', 'Scholars noted that 300 solar years come to about 309 lunar years.']
    ]]
  ],
  wow: [['300 years on the sun calendar is about 309 on the moon calendar, matching "300, and added nine".', 'Tafsir Ibn Kathir on 18:25'], ['Whoever memorises the first ten ayat of al-Kahf is protected from the Dajjal.', 'Sahih Muslim 809'], ['Their dog is mentioned four times, and is honoured forever in the Qur\'an.', 'Qur\'an 18:18, 18:22']],
  src: ['Qur\'an, al-Kahf 18:9-26', 'Sahih Muslim 809', 'Sahih al-Bukhari 435', 'Tafsir Ibn Kathir on 18:9-26']
};

X['two-gardens'] = {
  era: 'unknown', eraNote: 'Allah gives it as an example. Scholars differ on whether the two men really lived or are a parable.',
  place: [], placeNote: 'No place is given. It is told as an example for every time and place.',
  who: [['The garden owner', 'b', 'Rich, proud, and sure his wealth would last'], ['His companion', 'g', 'Poorer, but rich in faith and good advice']],
  ch: [
    ['Two men', [
      'Allah says: give them the example of two men (18:32).',
      'One was given two gardens of grapevines, surrounded by date palms, with crops growing between them. A river ran through the middle. Both gardens gave their full harvest, and nothing fell short (18:32-33).',
      ['t', 'IslamQA, citing Ibn \'Uthaymin and others', 'Some scholars say these two men really existed; others say it is a parable, like other examples in the Qur\'an. Either way, Allah teaches through it.']
    ]],
    ['"I have more than you"', [
      'The owner turned to his companion: "I have more wealth than you, and more people behind me" (18:34).',
      'Then he walked into his garden, wronging himself, and said: "I don\'t think this will ever end. I don\'t think the Hour will ever come. And even if I am returned to my Lord, I\'ll find something even better there" (18:35-36).',
      'Look at the three steps: pride in what he had, certainty it would last, and confidence that even Allah owed him.'
    ]],
    ['The companion\'s answer', [
      'His friend didn\'t answer with envy. He answered with faith: "Do you disbelieve in the One who created you from dust, then a drop, then shaped you into a man? But as for me, He is Allah, my Lord, and I will not associate anyone with my Lord" (18:37-38).',
      ['q', '18:39', 'When you entered your garden, why didn\'t you say: "Ma sha Allah, la quwwata illa billah" (what Allah wills; there is no power except with Allah)?'],
      'Then he added: maybe my Lord will give me something better than your garden, and send on yours a disaster from the sky, or its water will sink so deep you can never reach it (18:40-41).'
    ]],
    ['Wringing his hands', [
      'And that is what happened. His fruit was destroyed, and he was left turning his hands over in regret for all he had spent on it, while the vines lay collapsed on their trellises (18:42).',
      'He said: "I wish I had never associated anyone with my Lord." No group could help him, and he could not help himself (18:42-43).',
      ['?', 'His companion predicted it. Was he cursing him?', 'No. He was reminding him that everything belongs to Allah. The two words he wished his friend had said, "Ma sha Allah", would have kept his heart in the right place.']
    ]],
    ['Like rain on the earth', [
      'Allah follows the story with another picture: this life is like rain that falls, mixes with the plants of the earth, and then they dry into straw scattered by the wind (18:45).',
      'Wealth and children are the decoration of this life. But the good deeds that last are better with your Lord, and better to hope for (18:46).',
      ['h', 'Sahih al-Bukhari 4205', 'The Prophet ﷺ called "la hawla wa la quwwata illa billah" one of the treasures of Paradise.']
    ]]
  ],
  wow: [['Saying "Ma sha Allah" when admiring something comes from this story.', 'Qur\'an 18:39'], ['"La hawla wa la quwwata illa billah" is a treasure from the treasures of Paradise.', 'Sahih al-Bukhari 4205']],
  src: ['Qur\'an, al-Kahf 18:32-46', 'Sahih al-Bukhari 4205', 'IslamQA 224977']
};

})(window.IFM_STORY_X);
(function (X) {

X['garden-owners'] = {
  era: 'before', eraNote: 'Tafsir reports say they were People of the Book who lived some time after Isa.',
  place: [['Darawan, near Sana\'a, Yemen (one view)', 15.30, 44.18, 0]], placeNote: 'Sa\'id ibn Jubayr said the garden was at Darawan, six miles from Sana\'a. Another view places it in Abyssinia.',
  who: [['Their father', 'g', 'Used to give the poor their share of the harvest (tafsir)'], ['The brothers', 'b', 'Planned to keep it all'], ['The best of them', 'g', 'The one voice that called them back to Allah'], ['The poor', 'g', 'The people they tried to keep out']],
  ch: [
    ['A father who shared', [
      'Allah tells Quraysh: "We have tested them, as We tested the owners of the garden" (68:17).',
      ['t', 'Tafsir Ibn Kathir, from Sa\'id ibn Jubayr', 'Early scholars reported that the garden had belonged to a righteous father who gave a share of every harvest to the poor. When he died, his sons said: our father was foolish to give so much away.']
    ]],
    ['The secret plan', [
      'They swore an oath: we will harvest it first thing in the morning (68:17). They made no exception, not even "if Allah wills" (68:18).',
      'The plan was simple. Get there before anyone else woke. Take everything. Leave nothing for the poor.'
    ]],
    ['A visitor in the night', [
      'While they slept, something came upon the garden from their Lord (68:19). By morning it was like a field already stripped bare, black as night (68:20).',
      'They didn\'t know. They were still asleep, dreaming of the harvest.'
    ]],
    ['Whispering at dawn', [
      'At dawn they called to each other: "Go out early to your crop, if you want to harvest it" (68:21-22).',
      ['q', '68:23', 'So they set off, whispering to each other: "No poor person will get in to you today."'],
      'Picture them, creeping along in low voices so no one would hear, sure of their strength (68:25).'
    ]],
    ['"We are lost"', [
      'When they saw it, they said: "We must have taken the wrong way!" Then the truth hit: "No, we have been deprived" (68:26-27).',
      'They had set out to deprive the poor. They were the ones deprived.'
    ]],
    ['The best of them', [
      'One of them, the most balanced and just, said: "Didn\'t I tell you? Why don\'t you glorify Allah?" (68:28).',
      'And this time they listened: "Glory be to our Lord! We were truly wrongdoers" (68:29). They turned on each other with blame, then admitted: "Woe to us, we went too far. Maybe our Lord will give us something better in its place. We turn to our Lord in hope" (68:30-32).',
      ['?', 'Who is the real hero of this story?', 'The one brother who spoke up, even after going along at first. One honest voice turned a whole group back to Allah.'],
      ['t', 'Tafsir al-Jalalayn', 'Some reports say they repented sincerely and were given a better garden in its place. Allah knows best.'],
      'Allah ends: "Such is the punishment, and the punishment of the Hereafter is greater, if only they knew" (68:33).'
    ]]
  ],
  wow: [['The story was told to Quraysh as a mirror: they too had been given plenty, and tested with it.', 'Qur\'an 68:17'], ['The garden was ruined while they slept, and they set off at dawn not knowing.', 'Qur\'an 68:19-23']],
  src: ['Qur\'an, al-Qalam 68:17-33', 'Tafsir Ibn Kathir on 68:17-33', 'Tafsir al-Jalalayn on 68:32']
};

X['sabbath'] = {
  era: 'kings', eraNote: 'After Musa. Tafsir links it to the time of Dawud (see 5:78).',
  place: [['Ayla, today Aqaba / Eilat (one view)', 29.53, 35.00, 0]], placeNote: 'Ibn Abbas said it was Ayla, on the Red Sea coast. The Qur\'an says "a town by the sea".',
  who: [['The rule-breakers', 'b', 'Found a trick to fish on the Sabbath'], ['The warners', 'g', 'Kept telling them to stop'], ['The silent group', 'g', 'Didn\'t fish, but gave up warning'], ['The fish', 'a', 'Came on the one day they were forbidden']],
  ch: [
    ['A town by the sea', [
      'Allah tells the Prophet ﷺ: ask them about the town that was by the sea (7:163).',
      'Saturday, the Sabbath, was set apart for them. No work, no fishing. And that was exactly when the fish came: on the Sabbath they rose to the surface, plain to see. On other days, they didn\'t come at all (7:163).',
      'Allah says: "That is how We tested them, because they were rebellious."'
    ]],
    ['The trick', [
      'Some of them couldn\'t stand it. They didn\'t openly break the rule. They got around it.',
      ['t', 'Tafsir Ibn Kathir', 'Scholars of tafsir report that they set nets and dug channels on Friday, let the fish swim in on Saturday, and collected them on Sunday, telling themselves they hadn\'t fished on the Sabbath.'],
      ['?', 'Technically, they didn\'t fish on Saturday. So what was wrong?', 'They kept the outside of the rule and broke its whole purpose. Allah calls it transgression (7:163). A trick to make the forbidden look allowed is still the forbidden.']
    ]],
    ['Three groups', [
      'The town split into three. Those who broke the rule. Those who warned them. And a third group who said to the warners: "Why bother preaching to a people Allah is going to destroy or punish?" (7:164).',
      ['q', '7:164', 'They said, "To have an excuse before your Lord, and perhaps they will become mindful."'],
      'They didn\'t warn because they expected success. They warned because it was right.'
    ]],
    ['The punishment', [
      'When the rule-breakers ignored every reminder, Allah saved those who had forbidden evil and seized the wrongdoers with a severe punishment (7:165).',
      'When they persisted, He said to them: "Be apes, despised" (7:166; 2:65).',
      ['h', 'Sahih Muslim 2663', 'The Prophet ﷺ explained that people Allah transforms are not given offspring, and that apes and pigs existed before this happened. So today\'s animals are not their descendants.']
    ]],
    ['What about the silent?', [
      'The Qur\'an says the warners were saved and the wrongdoers punished. It says nothing about the middle group.',
      ['t', 'Tafsir Ibn Kathir', 'Ibn Abbas was unsure about them at first. His student \'Ikrimah argued that they had disliked the sin, so they were saved. Ibn Abbas agreed, and was so pleased that he gave \'Ikrimah a cloak.'],
      'The story still asks us: when we see wrong, which of the three groups are we in?'
    ]]
  ],
  wow: [['Ibn Abbas changed his view after his student\'s argument, and rewarded him with a cloak.', 'Tafsir Ibn Kathir on 7:165'], ['Transformed people have no descendants; today\'s apes are not them.', 'Sahih Muslim 2663'], ['The warners said they spoke up "to have an excuse before your Lord", not because they expected to win.', 'Qur\'an 7:164']],
  src: ['Qur\'an, al-A\'raf 7:163-166; al-Baqarah 2:65-66', 'Sahih Muslim 2663', 'Tafsir Ibn Kathir on 7:163-166']
};

X['elephant'] = {
  era: 'before', eraNote: 'The Year of the Elephant, about 570 CE. Most scholars say the Prophet ﷺ was born that same year.',
  place: [['Makkah', 21.42, 39.83, 1], ['Sana\'a, where Abraha set out', 15.35, 44.21, 0]], placeNote: 'Makkah is clear from the surah and the seerah.',
  who: [['Abraha', 'r', 'Ruler of Yemen who marched to destroy the Ka\'bah'], ['\'Abd al-Muttalib', 'g', 'Leader of Makkah, grandfather of the Prophet ﷺ'], ['The elephant', 'a', 'Refused to march on the Ka\'bah (seerah)'], ['The birds', 'a', 'Came in flocks, carrying stones of baked clay']],
  ch: [
    ['A rival to the Ka\'bah', [
      ['t', 'Seerah of Ibn Ishaq, in Tafsir Ibn Kathir', 'Abraha, the Abyssinian ruler of Yemen, built a great church in Sana\'a to draw the Arabs away from the Ka\'bah. When the Arabs showed contempt for it, he swore to destroy the Ka\'bah and marched on Makkah with a huge army and elephants.'],
      'No Arab army could stand against elephants. Makkah had no walls and no soldiers to match them.'
    ]],
    ['"The House has a Lord"', [
      ['t', 'Seerah of Ibn Ishaq', 'Abraha\'s army seized camels belonging to \'Abd al-Muttalib, the leader of Makkah. When he met Abraha, he only asked for his camels back. Abraha was surprised he didn\'t plead for the Ka\'bah. \'Abd al-Muttalib replied: "I am the owner of the camels. The House has a Lord who will protect it."'],
      'The people of Makkah went up into the mountains and waited.'
    ]],
    ['The elephant that wouldn\'t move', [
      ['t', 'Seerah of Ibn Ishaq', 'When the army turned towards Makkah, the lead elephant knelt and refused to move. Pointed in any other direction, it would walk. Pointed at the Ka\'bah, it would not.'],
      ['h', 'Sahih al-Bukhari 2731', 'Years later at Hudaybiyah, the Prophet\'s camel al-Qaswa\' knelt and wouldn\'t move. He said she hadn\'t become stubborn: "She has been held back by the One who held back the elephant."']
    ]],
    ['Birds in flocks', [
      ['q', '105:1', 'Haven\'t you seen how your Lord dealt with the people of the elephant?'],
      'Didn\'t He make their plan go wrong? He sent against them birds in flocks, pelting them with stones of baked clay, and left them like chewed-up straw (105:2-5).',
      'The greatest army in Arabia was undone by small birds. The Ka\'bah was never touched.'
    ]],
    ['The Year of the Elephant', [
      'The Arabs began dating events from that year. And in that same year, according to most scholars, Muhammad ﷺ was born in Makkah.',
      'The very next surah, Quraysh, continues the thought: let them worship the Lord of this House, who fed them in hunger and kept them safe from fear (106:3-4).'
    ]]
  ],
  wow: [['The Prophet ﷺ was born in the Year of the Elephant, according to most scholars.', 'Seerah'], ['At Hudaybiyah, the Prophet ﷺ said his camel was held back "by the One who held back the elephant".', 'Sahih al-Bukhari 2731'], ['Surah Quraysh (106) carries on straight from Surah al-Fil (105).', 'Qur\'an 105-106']],
  src: ['Qur\'an, al-Fil 105; Quraysh 106', 'Sahih al-Bukhari 2731', 'Seerah of Ibn Ishaq; Tafsir Ibn Kathir on Surah 105']
};

X['ditch'] = {
  era: 'before', eraNote: 'The Qur\'an and hadith give no date. Seerah writers linked a similar massacre to Najran in the early 500s CE.',
  place: [['Najran (one view)', 17.49, 44.13, 0]], placeNote: 'The hadith in Sahih Muslim doesn\'t name the place. Some scholars link it to Najran; others say it was a different people.',
  who: [['The boy', 'g', 'A young believer who gave his life so the people would believe'], ['The king', 'b', 'Claimed to be lord, and burned the believers'], ['The magician', 'b', 'Wanted the boy as his successor'], ['The monk', 'g', 'Taught the boy faith in Allah'], ['The courtier', 'g', 'Healed of blindness, and believed'], ['The mother and her baby', 'g', 'The last test at the fire']],
  ch: [
    ['The magician\'s apprentice', [
      'This story comes from a long, authentic hadith the Prophet ﷺ told his Companions (Sahih Muslim 3005). It is one of the most gripping stories in the Sunnah.',
      ['h', 'Sahih Muslim 3005', 'A king had a magician. When the magician grew old, he asked for a boy to train in his place. The king sent a boy. On his way to lessons, the boy passed a monk, sat with him, and loved what he heard.']
    ]],
    ['The beast in the road', [
      ['h', 'Sahih Muslim 3005', 'One day a huge beast blocked the road. The boy picked up a stone and said: "O Allah, if the monk\'s way is dearer to You than the magician\'s, kill this animal so the people can pass." He threw it, and the beast died.'],
      'The monk told him: "My son, today you are better than me. You will be tested. If you are, don\'t point to me."'
    ]],
    ['"Allah heals"', [
      ['h', 'Sahih Muslim 3005', 'By Allah\'s permission the boy healed the blind and people with leprosy. A blind courtier came with gifts. The boy said: "I don\'t heal anyone. Allah heals. If you believe in Allah, I\'ll pray for you." He believed, and Allah healed him.'],
      'The king saw his courtier walking in with sight. "Who gave you back your eyes?" "My Lord." "Do you have a lord other than me?" "My Lord and yours is Allah."',
      'The king tortured him until he named the boy. The boy was tortured until he named the monk. The monk and the courtier were killed, and neither gave up their faith.'
    ]],
    ['The mountain and the sea', [
      ['h', 'Sahih Muslim 3005', 'Soldiers took the boy to the top of a mountain to throw him off. He prayed: "O Allah, protect me from them however You will." The mountain shook, they fell, and he walked back to the king. They took him out to sea to drown him. He prayed the same dua; the boat capsized, they drowned, and he walked back again.'],
      ['?', 'He survived twice. Why did the boy then tell the king exactly how to kill him?', 'Read on. He wasn\'t trying to save himself. He was trying to save the people.']
    ]],
    ['"In the name of Allah, Lord of the boy"', [
      ['h', 'Sahih Muslim 3005', 'The boy told the king: "You won\'t kill me unless you do what I say. Gather the people on one plain. Tie me to a tree trunk. Take an arrow from my quiver and say, \'In the name of Allah, Lord of the boy,\' then shoot." The king did. The arrow struck him and he died.'],
      'The whole crowd had heard it. "We believe in the Lord of the boy!" they cried, again and again.',
      'The king\'s advisers told him: "What you feared has happened. The people have believed."'
    ]],
    ['The ditch', [
      ['h', 'Sahih Muslim 3005', 'The king had ditches dug at the roads and filled with fire. Anyone who wouldn\'t give up their faith was thrown in. A woman came holding her baby and hesitated, and the baby said: "Mother, be patient. You are on the truth."'],
      ['q', '85:4', 'Destroyed were the people of the ditch.'],
      'The fire full of fuel, while they sat beside it, watching what they did to the believers. They hated them for one reason only: that they believed in Allah, the Almighty, the Praiseworthy (85:5-8).',
      'The people of the ditch thought they had won. Allah calls the believers\' end "the great success" (85:11).'
    ]]
  ],
  wow: [['The words "In the name of Allah, Lord of the boy" made a whole crowd believe at once.', 'Sahih Muslim 3005'], ['A baby at the fire told its mother to be patient.', 'Sahih Muslim 3005'], ['Surah al-Buruj calls the believers\' fate "the great success" (al-fawz al-kabir).', 'Qur\'an 85:11']],
  src: ['Qur\'an, al-Buruj 85:4-11', 'Sahih Muslim 3005', 'Tafsir Ibn Kathir on 85:4']
};

X['talut'] = {
  era: 'kings', eraNote: 'After Musa, before Dawud became king.',
  place: [['River Jordan', 32.10, 35.57, 0]], placeNote: 'The Qur\'an says "a river". Commentators on Sahih al-Bukhari identify it as the Jordan.',
  who: [['Their prophet', 'p', 'Named Shamwil (Samuel) in tafsir'], ['Talut', 'r', 'A king chosen for his knowledge and strength, not his wealth'], ['Jalut', 'b', 'Goliath, leader of the enemy army'], ['Dawud', 'p', 'A young soldier who killed Jalut, later king and prophet'], ['The 310-plus', 'g', 'The few who passed the river test']],
  ch: [
    ['"Give us a king"', [
      'After Musa, the leaders of the Children of Israel came to their prophet: "Appoint a king for us, and we will fight in Allah\'s way" (2:246).',
      'Their prophet knew them: "What if fighting is ordered and you don\'t fight?" "Why wouldn\'t we? We\'ve been driven from our homes and children." But when fighting was ordered, they turned away, except a few (2:246).'
    ]],
    ['"Not him!"', [
      '"Allah has sent you Talut as king." They objected at once: "How can he be king over us? We deserve it more, and he hasn\'t been given much wealth" (2:247).',
      'The answer: Allah chose him over you, and gave him more knowledge and physical strength. Allah gives His kingdom to whoever He wills.',
      'They were looking for money. Allah was looking at knowledge and strength.'
    ]],
    ['The sign of the Ark', [
      'As a sign, the Ark would come back to them, carrying tranquillity from their Lord and things left behind by the families of Musa and Harun, carried by angels (2:248).'
    ]],
    ['The river', [
      'Talut set out with his army, and told them: "Allah will test you with a river. Whoever drinks from it is not with me. Whoever doesn\'t taste it is with me, except a handful scooped in the hand" (2:249).',
      ['q', '2:249', 'But they drank from it, except a few of them.'],
      ['?', 'Why test an army with water, just before a battle?', 'Because battles are won by obedience and self-control before they are won by numbers. The river showed who would hold back when it was hard.'],
      ['h', 'Sahih al-Bukhari 3957', 'The Companions said the number at Badr was the same as Talut\'s men who crossed the river: just over three hundred and ten. And only believers crossed with him.']
    ]],
    ['How many small groups', [
      'On the far bank, some looked at the enemy and said: "We have no strength today against Jalut and his soldiers" (2:249).',
      'Those certain they would meet Allah answered with one of the most quoted lines in the Qur\'an: "How many a small group has defeated a large one, by Allah\'s permission. Allah is with the patient."',
      ['q', '2:250', 'Our Lord, pour patience on us, make our feet firm, and help us against the disbelieving people.']
    ]],
    ['Dawud and Jalut', [
      'They defeated them by Allah\'s permission, and Dawud killed Jalut (2:251).',
      ['t', 'Tafsir Ibn Kathir', 'Early reports describe Dawud as a young man who brought down Jalut with a stone from his sling.'],
      'Allah gave Dawud kingship and wisdom, and taught him what He willed. The youngest man on the field became the next king.'
    ]]
  ],
  wow: [['Talut\'s believers who crossed the river matched the number at Badr: just over 310.', 'Sahih al-Bukhari 3957'], ['The dua of Talut\'s army (2:250) is still made before exams and hard days.', 'Qur\'an 2:250'], ['Dawud, who killed Jalut, became both king and prophet.', 'Qur\'an 2:251']],
  src: ['Qur\'an, al-Baqarah 2:246-251', 'Sahih al-Bukhari 3957', 'Tafsir Ibn Kathir on 2:246-251']
};

X['luqman'] = {
  era: 'kings', eraNote: 'Tafsir reports place him around the time of Dawud.',
  place: [], placeNote: 'Tafsir reports describe him as from Nubia or Abyssinia. The Qur\'an gives no place.',
  who: [['Luqman', 'g', 'A wise man. Most scholars say he was not a prophet'], ['His son', 'g', 'The one he advised, with tenderness']],
  ch: [
    ['Given wisdom', [
      ['q', '31:12', 'We gave Luqman wisdom: "Be grateful to Allah." Whoever is grateful is grateful for his own good.'],
      ['t', 'Tafsir Ibn Kathir', 'Most early scholars held that Luqman was a righteous, wise man and not a prophet. Reports describe him as a dark-skinned man from Nubia or Abyssinia. A man with no title, and a whole surah named after him.'],
      'The Qur\'an then lets us listen in as a father talks to his son.'
    ]],
    ['"My dear son"', [
      'Every piece of advice starts the same way: "Ya bunayya", my dear little son. Not an order barked across a room. A father close, speaking softly.',
      'His first advice: "Don\'t associate anything with Allah. Shirk is a great injustice" (31:13).',
      ['h', 'Sahih al-Bukhari 32', 'When 6:82 was revealed, the Companions were worried: "Which of us doesn\'t wrong himself?" The Prophet ﷺ explained that the wrong meant there is shirk, as Luqman told his son.']
    ]],
    ['Your parents', [
      'Here Allah steps into the conversation Himself: "We have commanded people to be good to their parents. His mother carried him, weakness upon weakness, and weaning takes two years. Be grateful to Me and to your parents" (31:14).',
      'But if parents push you to associate others with Allah, don\'t obey them in that, and still treat them kindly in this world (31:15).',
      ['?', 'Why would Allah\'s own words about parents be placed in the middle of a father\'s advice?', 'Luqman doesn\'t mention himself. Allah reminds the son of his parents\' right, especially his mother\'s, inside his father\'s lesson.']
    ]],
    ['A mustard seed', [
      ['q', '31:16', 'My dear son, even if something were the weight of a mustard seed, inside a rock, or in the heavens or the earth, Allah will bring it out. Allah is Subtle, All-Aware.'],
      'Nothing you do is too small to count. Nothing hidden is hidden from Him.'
    ]],
    ['Prayer, good, patience', [
      '"My dear son, establish the prayer, command what is good, forbid what is wrong, and be patient with whatever befalls you. That is true determination" (31:17).'
    ]],
    ['How you carry yourself', [
      '"Don\'t turn your cheek away from people in arrogance, and don\'t walk proudly on the earth. Allah doesn\'t love the arrogant and boastful" (31:18).',
      '"Keep a moderate pace when you walk, and lower your voice. The harshest of sounds is the braying of donkeys" (31:19).',
      'Faith, gratitude, parents, prayer, patience, humility, even the way you walk and talk. A whole life, in a few lines.'
    ]]
  ],
  wow: [['A whole surah is named after a man most scholars say was not a prophet.', 'Qur\'an 31'], ['The Prophet ﷺ used Luqman\'s words to explain another ayah to the Companions.', 'Sahih al-Bukhari 32'], ['"Ya bunayya" is a tender form: "my dear little son".', 'Qur\'an 31:13']],
  src: ['Qur\'an, Luqman 31:12-19', 'Sahih al-Bukhari 32', 'Tafsir Ibn Kathir on 31:12']
};

})(window.IFM_STORY_X);
(function (X) {

X['yusuf'] = {
  era: 'yusuf', eraNote: 'Grandson of Ishaq and great-grandson of Ibrahim, long before Musa.',
  place: [['Canaan, where Yaqub lived', 31.53, 35.10, 0], ['Egypt', 29.85, 31.25, 1]], placeNote: 'Egypt is named in the surah (12:21, 12:99). Tafsir places Yaqub\'s family near Hebron in Canaan.',
  who: [['Yusuf', 'p', 'The dreamer, sold as a slave, who became a minister of Egypt'], ['Yaqub', 'p', 'His father, who lost his sight from grief and never lost hope'], ['The brothers', 'b', 'Threw him in a well, and later repented'], ['Binyamin', 'g', 'His full brother'], ['Al-\'Aziz', 'r', 'The Egyptian official who bought him'], ['The \'Aziz\'s wife', 'b', 'Tried to seduce him, and later confessed'], ['The king of Egypt', 'r', 'Whose dream changed everything']],
  ch: [
    ['Eleven stars', [
      'Allah calls this "the best of stories" (12:3). It is the only prophet\'s story told from start to finish in one surah.',
      'A boy woke and told his father: "Father, I saw eleven stars, and the sun and the moon. I saw them bowing down to me" (12:4).',
      'Yaqub knew what it meant, and he knew his other sons. "My son, don\'t tell your brothers your dream, or they will plot against you" (12:5).'
    ]],
    ['The plan', [
      'His brothers said: "Yusuf and his brother are dearer to our father than us, though we are a strong group" (12:8). "Kill Yusuf, or throw him somewhere far away, and our father\'s attention will be ours alone" (12:9).',
      'One of them said: "Don\'t kill him. Throw him into the bottom of a well, and some travellers will pick him up" (12:10).'
    ]],
    ['The well', [
      'They talked their father into sending Yusuf out with them. "Send him with us tomorrow to enjoy himself and play. We will look after him." Yaqub said: "I fear a wolf will eat him while you aren\'t watching" (12:12-13). They had their excuse ready-made.',
      'They threw him into the well. And at the bottom, alone, Allah told him: "You will one day tell them about this, when they don\'t realise who you are" (12:15).',
      'That night they came home weeping. "A wolf ate him." They brought his shirt, stained with false blood (12:16-18).',
      ['q', '12:18', 'He said, "No, your souls have tempted you into something. So beautiful patience. Allah is the One whose help is sought against what you describe."'],
      ['?', 'The brothers brought a bloody shirt. What gave the lie away?', 'The Qur\'an only says the blood was false. Scholars of tafsir noted the shirt wasn\'t torn: a wolf that ate a boy left his shirt in one piece (Tafsir Ibn Kathir).']
    ]],
    ['A few coins', [
      'Travellers came. Their water-drawer let down his bucket and called out: "Good news! A boy!" (12:19). They hid him as goods to sell, and sold him for a few coins (12:20).',
      'The man in Egypt who bought him told his wife: "Make his stay comfortable. Maybe he\'ll be useful to us, or we\'ll adopt him" (12:21). Allah says: that is how We settled Yusuf in the land.'
    ]],
    ['The locked doors', [
      'Yusuf grew up, and Allah gave him wisdom and knowledge (12:22). The wife of the man in whose house he lived tried to seduce him. She closed the doors and said: "Come here."',
      'He said: "I seek refuge in Allah! He is my master, who gave me a good home. Wrongdoers never succeed" (12:23).',
      'He ran for the door, and she tore his shirt from behind. At the door stood her husband (12:25). She accused Yusuf at once. A witness from her own family said: if the shirt is torn at the front, she is truthful; if it is torn at the back, he is truthful. It was torn at the back (12:26-28).',
      ['t', 'Tafsir', 'Her name is often given as Zulaykha. This comes from later reports, not the Qur\'an.']
    ]],
    ['The knives', [
      'The women of the city gossiped about her. So she invited them, gave each a knife, and called Yusuf in. When they saw him, they were so stunned they cut their hands and said: "This is no human. This is a noble angel!" (12:30-31).',
      ['h', 'Sahih Muslim 162', 'The Prophet ﷺ said that on the Night Journey he met Yusuf, who had been given half of all beauty.'],
      'Yusuf turned to Allah: "My Lord, prison is dearer to me than what they invite me to" (12:33). And he was sent to prison, though he was innocent.'
    ]],
    ['Two dreams in prison', [
      'Two young men entered prison with him. One dreamed he was pressing wine; the other that birds were eating bread from his head (12:36).',
      'Before answering, Yusuf used the moment to call them to Allah: "My two prison companions, are many different lords better, or Allah, the One, the Supreme?" (12:39).',
      'Then: one would pour drinks for his master again; the other would be crucified and birds would eat from his head. To the first he said: "Mention me to your master" (12:41-42). But Shaytan made him forget, and Yusuf stayed in prison for several years.'
    ]],
    ['The king\'s dream', [
      'The king dreamed of seven fat cows eaten by seven thin ones, and seven green ears of corn and seven dry (12:43). No one could explain it. Then the cup-bearer remembered: "Send me to Yusuf" (12:45).',
      'Yusuf explained it and gave a plan: farm for seven years and leave the grain in its ears, then seven hard years will eat it up, then a year of relief (12:47-49).'
    ]],
    ['Cleared', [
      'The king said: "Bring him to me." But Yusuf refused to leave: "Go back and ask about the women who cut their hands" (12:50). He would walk out innocent, or not at all.',
      'The women said: "We know nothing bad about him." The \'Aziz\'s wife said: "Now the truth is out. I tried to seduce him, and he is truthful" (12:51).',
      'The king made him a trusted official. Yusuf asked: "Put me in charge of the storehouses of the land. I am a knowing guardian" (12:55).'
    ]],
    ['The brothers come', [
      'The famine reached Canaan. Yusuf\'s brothers came to Egypt for grain. He recognised them; they didn\'t recognise him (12:58).',
      'He told them: next time, bring your brother from your father. And he had their payment slipped back into their bags (12:59-62).',
      'Yaqub didn\'t want to let Binyamin go: "Shall I trust you with him as I trusted you with his brother before?" (12:64). He let him go only after a solemn promise.'
    ]],
    ['The cup', [
      'Yusuf took Binyamin aside: "I am your brother. Don\'t be sad about what they did" (12:69). Then the king\'s cup was placed in Binyamin\'s bag, and a call went out: "Caravan, you are thieves!" (12:70).',
      'When it was found, the brothers said: "If he stole, a brother of his stole before" (12:77), meaning Yusuf himself.',
      ['?', 'Yusuf heard them call him a thief to his face. What did he do?', 'He kept it inside and didn\'t show it to them (12:77). Years of power, and he still didn\'t take revenge.']
    ]],
    ['Don\'t despair', [
      'The eldest refused to go home without Binyamin. The rest returned to their father with the news. Yaqub turned away: "Oh, my sorrow for Yusuf." His eyes turned white from grief (12:84).',
      '"I only complain of my grief and sorrow to Allah, and I know from Allah what you don\'t" (12:86).',
      ['q', '12:87', 'My sons, go and search for Yusuf and his brother, and don\'t despair of Allah\'s mercy. Only the disbelieving people despair of Allah\'s mercy.']
    ]],
    ['"I am Yusuf"', [
      'They came back to Egypt, desperate. Yusuf asked: "Do you know what you did to Yusuf and his brother?" (12:89).',
      '"Are you really Yusuf?" "I am Yusuf, and this is my brother. Allah has been gracious to us" (12:90).',
      ['q', '12:92', 'He said, "No blame on you today. May Allah forgive you. He is the Most Merciful of the merciful."'],
      ['t', 'Seerah, reported by Ibn Ishaq', 'When the Prophet ﷺ entered Makkah in victory, he is reported to have quoted these words of Yusuf to the people who had driven him out.']
    ]],
    ['The dream comes true', [
      'Yusuf sent his shirt home: "Put it over my father\'s face, and his sight will return" (12:93). As the caravan left Egypt, Yaqub said: "I can smell Yusuf" (12:94). The shirt was laid on his face, and he could see again.',
      'The family came to Egypt. Yusuf raised his parents onto the throne, and they all bowed before him. "Father, this is the meaning of my dream from long ago. My Lord has made it come true" (12:100).',
      ['q', '12:101', 'Creator of the heavens and the earth, You are my protector in this world and the Hereafter. Let me die as a Muslim, and join me with the righteous.'],
      'At the height of everything, his dua wasn\'t for more. It was for a good ending.'
    ]]
  ],
  wow: [['"The noble one, son of the noble one, son of the noble one, son of the noble one: Yusuf, son of Yaqub, son of Ishaq, son of Ibrahim."', 'Sahih al-Bukhari 3390'], ['Yusuf was given half of all beauty.', 'Sahih Muslim 162'], ['It is the only prophet\'s story told complete in a single surah.', 'Qur\'an 12']],
  src: ['Qur\'an, Yusuf 12:1-101', 'Sahih al-Bukhari 3390', 'Sahih Muslim 162', 'Tafsir Ibn Kathir on Surah Yusuf']
};

X['nuh'] = {
  era: 'nuh', eraNote: 'Long before Ibrahim. Nuh is called the first messenger sent to the people of the earth.',
  place: [['Mount Judi, where the Ark came to rest', 37.37, 42.35, 0]], placeNote: 'The Qur\'an names al-Judi (11:44). Tafsir places it in the north of Mesopotamia, near today\'s Turkey-Iraq border.',
  who: [['Nuh', 'p', 'Called his people for 950 years'], ['His people', 'b', 'Mocked him and refused'], ['The believers', 'g', 'A few who boarded the Ark'], ['His son', 'b', 'Refused to board'], ['His wife', 'b', 'Given in the Qur\'an as an example of disbelief (66:10)']],
  ch: [
    ['How idols began', [
      'Nuh\'s people worshipped idols named Wadd, Suwa\', Yaghuth, Ya\'uq and Nasr (71:23). But they hadn\'t always.',
      ['h', 'Sahih al-Bukhari 4920', 'Ibn Abbas explained that these were names of righteous men from Nuh\'s people. When they died, Shaytan suggested making statues of them in their gathering places, to remember them. No one worshipped them. When that generation passed and knowledge was forgotten, the statues were worshipped.'],
      'It didn\'t start with worship. It started with "just a reminder".'
    ]],
    ['Nine hundred and fifty years', [
      ['h', 'Sahih al-Bukhari 4712', 'On the Day of Judgement, people will come to Nuh and say: "You are the first messenger sent to the people of the earth."'],
      'Allah says Nuh stayed among them a thousand years less fifty (29:14).',
      'Nuh described it to his Lord: "I called my people night and day, but my calling only made them run further. Every time I called them so You could forgive them, they put their fingers in their ears, covered themselves with their clothes, and grew more arrogant" (71:5-7).',
      '"I called them openly, and I spoke to them in public and in private" (71:8-9).'
    ]],
    ['"Ask your Lord for forgiveness"', [
      ['q', '71:10', 'I said: Ask your Lord for forgiveness. He is ever Forgiving.'],
      '"He will send the sky down on you in abundant rain, give you wealth and children, and give you gardens and rivers" (71:11-12). Scholars still quote these ayat about the blessings that come with istighfar.'
    ]],
    ['Build the ship', [
      'The leaders sneered: "We only see you as a man like us, and the only ones following you are the lowest of us" (11:27).',
      'Then Allah told Nuh: no more of your people will believe except those who already have. "Build the ship under Our eyes and Our inspiration" (11:36-37).',
      'Every time leaders of his people passed by, they mocked him. He said: "If you mock us, we will mock you just as you mock. You will soon know" (11:38-39). A ship, built far from the sea, laughed at by a whole nation.'
    ]],
    ['The oven gushed', [
      'Then the command came, and the oven gushed (11:40). "Load onto it a pair of every kind, your family except those already decided against, and those who believe. And only a few believed with him."',
      ['q', '11:41', 'He said, "Board it. In the name of Allah it sails and comes to rest. My Lord is Forgiving, Merciful."'],
      'The ship sailed with them on waves like mountains (11:42).'
    ]],
    ['"My son!"', [
      'Nuh saw his son standing apart. "My son, come aboard with us, and don\'t be with the disbelievers."',
      '"I will take shelter on a mountain. It will protect me from the water."',
      '"No one is protected today from Allah\'s command, except those He has mercy on." And a wave came between them, and he was among the drowned (11:42-43).'
    ]],
    ['"Earth, swallow your water"', [
      ['q', '11:44', 'It was said, "Earth, swallow your water, and sky, hold back." The water sank, the matter was settled, and the ship came to rest on al-Judi.'],
      'Nuh called to his Lord: "My son was from my family, and Your promise is true." Allah said: "He is not of your family. His deeds were not righteous" (11:45-46).',
      'Nuh asked forgiveness for even asking. Then he was told: "Go down in peace from Us, with blessings on you and on nations from those with you" (11:48).',
      ['?', 'A prophet\'s own son, and his own wife (66:10), were not saved. What does that tell us?', 'Faith isn\'t inherited. Being close to righteous people doesn\'t save anyone on its own; each person answers for themselves.']
    ]]
  ],
  wow: [['The idols of Nuh\'s people began as statues of righteous men.', 'Sahih al-Bukhari 4920'], ['Allah calls Nuh "a truly grateful servant".', 'Qur\'an 17:3'], ['Allah says He left the ship as a sign: "Is there anyone who will take heed?"', 'Qur\'an 54:15']],
  src: ['Qur\'an, Hud 11:25-49; Nuh 71; al-\'Ankabut 29:14; at-Tahrim 66:10', 'Sahih al-Bukhari 4920, 4712', 'Tafsir Ibn Kathir on 11:44']
};

X['yunus'] = {
  era: 'later', eraNote: 'The Qur\'an doesn\'t give a date. Historians place Nineveh\'s height a few centuries after Sulayman.',
  place: [['Nineveh (Mosul), Iraq', 36.36, 43.15, 0]], placeNote: 'The Prophet ﷺ is reported to have called Nineveh "the town of the righteous man Yunus" in the seerah. The Qur\'an says he was sent to 100,000 or more.',
  who: [['Yunus', 'p', 'Dhun-Nun, "the man of the whale"'], ['The sailors', 'g', 'Drew lots on the overloaded ship'], ['The whale', 'a', 'Swallowed him, by Allah\'s command'], ['The people of Nineveh', 'g', 'The only town that believed in time']],
  ch: [
    ['He left in anger', [
      'Yunus was sent to his people, and they wouldn\'t listen. So he left them, angry, thinking Allah would not hold him to account for it (21:87).',
      'He fled to a ship that was fully loaded (37:140).',
      ['t', 'Seerah of Ibn Ishaq', 'When the Prophet ﷺ was in Ta\'if, a servant named \'Addas told him he was from Nineveh. The Prophet ﷺ said: "The town of the righteous man Yunus son of Matta? He was my brother. He was a prophet, and I am a prophet."']
    ]],
    ['The lots', [
      'Out at sea, the ship was overloaded. They drew lots, and Yunus lost (37:141).',
      'He was thrown overboard, and a great fish swallowed him, while he was to blame (37:142).'
    ]],
    ['In the darkness', [
      'Darkness of night. Darkness of the deep sea. Darkness inside the whale.',
      ['t', 'Tafsir Ibn Kathir, from Ibn Mas\'ud and Ibn Abbas', 'The Companions explained "the darknesses" (21:87) as these three: the night, the sea, and the belly of the whale.'],
      'From inside all of it, he called out.',
      ['q', '21:87', 'There is no god but You. Glory be to You. I was truly one of the wrongdoers.'],
      'No blaming his people. No excuses. Only Allah\'s oneness, His perfection, and his own mistake.'
    ]],
    ['If he hadn\'t', [
      'Allah says: if he hadn\'t been one of those who glorify Him, he would have stayed in its belly until the Day they are raised (37:143-144).',
      ['h', 'Jami\' at-Tirmidhi 3505 (sahih)', 'The Prophet ﷺ said that no Muslim ever calls on Allah with the dua of Dhun-Nun for anything, except that Allah answers him.'],
      'So Allah answered him, and saved him from his distress. "That is how We save the believers" (21:88).'
    ]],
    ['On the shore', [
      'He was thrown onto open land, weak and ill. Allah made a gourd plant grow over him for shade (37:145-146).'
    ]],
    ['The town that believed', [
      'And his people? Allah sent him to a hundred thousand or more, and they believed, so He let them enjoy life for a while (37:147-148).',
      ['q', '10:98', 'If only a town had believed and benefited from its belief, except the people of Yunus. When they believed, We removed from them the humiliating punishment in this life.'],
      ['?', 'He left them thinking they would never believe. What does it tell you that they did?', 'Don\'t give up on people. Hearts belong to Allah, and the town he walked away from became the only town in the Qur\'an saved this way.']
    ]]
  ],
  wow: [['No Muslim makes the dua of Yunus for anything, except that Allah answers.', 'Jami\' at-Tirmidhi 3505'], ['His people are the only nation in the Qur\'an saved after punishment had drawn near.', 'Qur\'an 10:98'], ['The Prophet ﷺ said: "Don\'t say I am better than Yunus son of Matta."', 'Sahih al-Bukhari 3416']],
  src: ['Qur\'an, al-Anbiya\' 21:87-88; as-Saffat 37:139-148; Yunus 10:98', 'Jami\' at-Tirmidhi 3505', 'Sahih al-Bukhari 3416', 'Seerah of Ibn Ishaq']
};

X['ibrahim'] = {
  era: 'ibrahim', eraNote: 'The father of the prophets. Historians place him roughly 4,000 years ago; the Qur\'an gives no date.',
  place: [['Iraq, his homeland (Babylon area, per tafsir)', 32.20, 44.60, 0], ['Makkah, where he left Hajar and Isma\'il', 21.42, 39.83, 1]], placeNote: 'Makkah is certain from the Qur\'an (14:37, 2:127). Tafsir places his early life in Iraq.',
  who: [['Ibrahim', 'p', 'Khalilullah, the friend of Allah'], ['Azar', 'b', 'His father, who made and kept idols'], ['The king', 'r', 'Who argued about his Lord. Named Namrud in tafsir'], ['Hajar', 'g', 'Left with her baby in an empty valley, trusting Allah'], ['Isma\'il', 'p', 'His son, who said "you will find me patient"']],
  ch: [
    ['Looking at the sky', [
      'Ibrahim looked at a star and said, "This is my lord?" When it set, he said: "I don\'t love things that set." Then the moon, then the sun: "This is bigger!" Each one disappeared (6:76-78).',
      ['q', '6:79', 'I have turned my face to the One who created the heavens and the earth, sincerely, and I am not one of those who associate partners.'],
      ['t', 'Tafsir Ibn Kathir', 'Ibn Kathir explains this was Ibrahim debating his people, who worshipped stars, walking them step by step to the truth. It was not a prophet in doubt.']
    ]],
    ['"Dear father"', [
      'His first call was to his own father: "Father, why worship something that can\'t hear, can\'t see, and can\'t help you at all?" (19:42).',
      'Four times he began: "Ya abati", dear father. His father threatened to stone him: "Leave me for a long time" (19:46).',
      'Ibrahim\'s reply: "Peace be upon you. I will ask my Lord to forgive you" (19:47).'
    ]],
    ['The idols', [
      '"What are these statues you keep devoting yourselves to?" "We found our fathers worshipping them." "Then you and your fathers have been clearly lost" (21:52-54).',
      'While the people were away, he broke them into pieces, all except the biggest one (21:58).',
      '"Who did this to our gods?" "We heard a young man talking about them. He\'s called Ibrahim." "Did you do this?" (21:59-62).',
      ['q', '21:63', 'He said, "No, this one, the biggest of them, did it. So ask them, if they can speak."'],
      ['?', 'Ibrahim pointed at the biggest idol. Why?', 'To make them say it themselves. And they did: "You know these don\'t speak" (21:65). Then he asked: "So you worship, instead of Allah, things that can neither benefit nor harm you?"']
    ]],
    ['Into the fire', [
      'They had no answer, so they turned to force: "Burn him, and support your gods" (21:68).',
      ['h', 'Sahih al-Bukhari 4563', 'Ibn Abbas said: when Ibrahim was thrown into the fire, his last words were "Hasbunallahu wa ni\'mal wakil": Allah is enough for us, and the best one to rely on.'],
      ['q', '21:69', 'We said, "Fire, be cool and safe for Ibrahim."'],
      'Fire does what Allah tells it. They wanted to harm him, and Allah made them the losers (21:70).'
    ]],
    ['The king who argued', [
      'A king argued with Ibrahim about his Lord, because Allah had given him power. Ibrahim said: "My Lord gives life and causes death." The king said: "I give life and cause death" (2:258).',
      'Ibrahim said: "Allah brings the sun up from the east. Bring it up from the west." And the disbeliever was left speechless.',
      ['t', 'Tafsir Ibn Kathir', 'This king is named Namrud in tafsir reports.']
    ]],
    ['An empty valley', [
      ['h', 'Sahih al-Bukhari 3364', 'Ibrahim brought Hajar and their baby Isma\'il to an empty valley at Makkah, with a bag of dates and a skin of water, and turned to leave. She followed him: "Are you leaving us here, where there is nobody and nothing?" He didn\'t answer. "Did Allah command you to do this?" "Yes." "Then He will not abandon us."'],
      ['q', '14:37', 'Our Lord, I have settled some of my family in a valley without farmland, by Your Sacred House…'],
      ['h', 'Sahih al-Bukhari 3364', 'When the water ran out, Hajar ran between the hills of Safa and Marwah seven times looking for help. Then an angel struck the ground and water burst out: Zamzam. The Prophet ﷺ said that is why pilgrims walk between them.']
    ]],
    ['The dream', [
      'Years later, Isma\'il was old enough to walk with his father. Ibrahim said: "My son, I have seen in a dream that I am sacrificing you. What do you think?" (37:102).',
      ['q', '37:102', 'He said, "Father, do what you are commanded. You will find me, if Allah wills, one of the patient."'],
      'When they had both submitted, and he laid him down on his forehead, Allah called: "Ibrahim, you have fulfilled the vision" (37:103-105). Allah ransomed him with a great sacrifice (37:107). Every Eid al-Adha remembers that moment.'
    ]],
    ['Raising the House', [
      'Father and son raised the foundations of the Ka\'bah together, praying as they built:',
      ['q', '2:127', 'Our Lord, accept this from us. You are the All-Hearing, the All-Knowing.'],
      'They asked Allah to send a messenger from among the people of that valley (2:129). Many centuries later, Muhammad ﷺ was born there: the answer to Ibrahim\'s dua.'
    ]]
  ],
  wow: [['Hajar\'s run between Safa and Marwah is why every pilgrim walks it.', 'Sahih al-Bukhari 3364'], ['"Hasbunallahu wa ni\'mal wakil" were Ibrahim\'s words as he was thrown into the fire.', 'Sahih al-Bukhari 4563'], ['Allah took Ibrahim as His khalil, His close friend.', 'Qur\'an 4:125']],
  src: ['Qur\'an, al-An\'am 6:74-79; Maryam 19:41-48; al-Anbiya\' 21:51-70; al-Baqarah 2:127-129, 2:258; Ibrahim 14:37; as-Saffat 37:99-111', 'Sahih al-Bukhari 3364, 4563', 'Tafsir Ibn Kathir']
};

X['maryam'] = {
  era: 'isa', eraNote: 'About 2,000 years ago, just before the birth of Isa.',
  place: [['Jerusalem (Bayt al-Maqdis)', 31.78, 35.23, 0], ['Bethlehem (per tafsir)', 31.70, 35.20, 0]], placeNote: 'Maryam was raised in the place of worship in Jerusalem. Tafsir places the birth of Isa in Bethlehem.',
  who: [['Maryam', 'g', 'Chosen above the women of the worlds'], ['The wife of \'Imran', 'g', 'Her mother, who dedicated her before birth'], ['Zakariyya', 'p', 'Her guardian, given a son in old age'], ['Jibril', 's', 'The angel who brought the news'], ['Isa', 'p', 'Her son, who spoke from the cradle']],
  ch: [
    ['A promise before birth', [
      'The wife of \'Imran said: "My Lord, I have vowed to You what is in my womb, dedicated to Your service. Accept it from me" (3:35).',
      'When she gave birth, she said: "My Lord, I have given birth to a girl," and Allah knew best what she had delivered. "I have named her Maryam, and I seek Your protection for her and her children from Shaytan" (3:36).',
      ['h', 'Sahih al-Bukhari 3431', 'The Prophet ﷺ said every baby is touched by Shaytan at birth, which is why it cries out, except Maryam and her son.']
    ]],
    ['Food from nowhere', [
      'Allah accepted her beautifully, and placed her with Zakariyya (3:37). The priests drew lots with their pens to decide who would raise her (3:44).',
      ['q', '3:37', 'Every time Zakariyya went in to her in the sanctuary, he found food with her. He said, "Maryam, where did this come from?" She said, "It is from Allah. Allah provides for whoever He wills without measure."'],
      'Then and there, Zakariyya, old and childless, prayed for a child of his own (3:38). Allah gave him Yahya.'
    ]],
    ['The visitor', [
      'Maryam withdrew from her family to a place in the east, and screened herself off. Allah sent Jibril to her, in the form of a man (19:16-17).',
      '"I seek refuge in the Most Merciful from you, if you fear Him!" "I am only a messenger from your Lord, to give you a pure son" (19:18-19).',
      '"How can I have a son when no man has touched me?" "It is easy for Me," says your Lord (19:20-21).'
    ]],
    ['Under the palm tree', [
      'She carried him and withdrew to a far place. The pains of birth drove her to the trunk of a palm tree. "I wish I had died before this, and been completely forgotten" (19:22-23).',
      'A voice called from below her: "Don\'t grieve. Your Lord has placed a stream beneath you" (19:24).',
      ['q', '19:25', 'And shake the trunk of the palm tree towards you: it will drop fresh, ripe dates on you.'],
      '"Eat, drink, and be at peace. If you see anyone, say: I have vowed a fast to the Most Merciful, and I won\'t speak to anyone today" (19:26).',
      ['?', 'Allah could have dropped the dates without her doing anything. Why tell her to shake the tree?', 'Even at her weakest, she was asked to take one small step, and Allah did the rest. Scholars draw from this that we do what we can, and rely on Allah.']
    ]],
    ['The cradle speaks', [
      'She came back to her people carrying him. "Maryam, you have done something terrible! Sister of Harun, your father wasn\'t a bad man, and your mother wasn\'t unchaste" (19:27-28).',
      'She said nothing. She pointed to the baby. "How can we talk to a child in a cradle?" (19:29).',
      ['q', '19:30', 'He said, "I am the servant of Allah. He has given me the Book and made me a prophet."'],
      '"…Peace be on me the day I was born, the day I die, and the day I am raised alive" (19:33).',
      ['h', 'Sahih Muslim 2135', 'When Christians of Najran asked how she could be "sister of Harun" when Harun lived long before, the Prophet ﷺ explained that people used to name themselves after prophets and righteous people before them.']
    ]],
    ['Chosen', [
      ['q', '3:42', 'The angels said, "Maryam, Allah has chosen you, purified you, and chosen you above the women of the worlds."'],
      'She is the only woman named in the Qur\'an, and a whole surah carries her name.'
    ]]
  ],
  wow: [['Maryam is the only woman named in the Qur\'an.', 'Qur\'an'], ['She and her son were the only babies not touched by Shaytan at birth.', 'Sahih al-Bukhari 3431'], ['"Sister of Harun" was a name of honour, after a righteous ancestor.', 'Sahih Muslim 2135']],
  src: ['Qur\'an, Al \'Imran 3:35-47; Maryam 19:16-33', 'Sahih al-Bukhari 3431', 'Sahih Muslim 2135', 'Tafsir Ibn Kathir']
};

X['ayyub'] = {
  era: 'yusuf', eraNote: 'His exact time isn\'t known. Ibn Kathir lists him among the descendants of Ishaq.',
  place: [['Hauran, southern Syria (per tafsir)', 32.75, 36.20, 0]], placeNote: 'Tafsir reports place him in Hauran, in the land of Sham. The Qur\'an doesn\'t say.',
  who: [['Ayyub', 'p', 'The prophet of patience'], ['His wife', 'g', 'Stayed by him through it all'], ['Two close friends', 'g', 'The only ones who kept visiting']],
  ch: [
    ['A man who had everything', [
      ['t', 'Tafsir Ibn Kathir', 'Scholars of tafsir describe Ayyub as a man of great wealth: land, livestock and a large family. He was grateful for all of it.'],
      'Then, one by one, it was taken away. His wealth, his children, and finally his health.'
    ]],
    ['Eighteen years', [
      ['h', 'Sahih Ibn Hibban 2898 (graded sahih by al-Albani)', 'The Prophet ﷺ said Ayyub was tested for eighteen years. Relatives and strangers alike stayed away, except two men who were his closest brothers.'],
      ['t', 'Tafsir Ibn Kathir', 'Reports describe his wife staying with him, working to support them when no one else would.']
    ]],
    ['The friends\' doubt', [
      ['h', 'Sahih Ibn Hibban 2898', 'One day one of the two friends said to the other: "He must have committed a sin no one else ever has. Eighteen years, and Allah hasn\'t relieved him." The other repeated it to Ayyub.'],
      'Ayyub didn\'t argue about his own innocence. He said that when he used to pass two men arguing who mentioned Allah\'s name, he would go home and make amends on their behalf, worried that Allah\'s name had been mentioned in something untrue.',
      ['?', 'Accused of a terrible secret sin, what did Ayyub talk about?', 'Not himself. He spoke about how much he honoured Allah\'s name. Even under suspicion, his worry was for Allah, not his reputation.']
    ]],
    ['His dua', [
      ['q', '21:83', 'And Ayyub, when he called to his Lord: "Harm has touched me, and You are the Most Merciful of the merciful."'],
      'Notice what he didn\'t say. No "why me?" No "take it away now." He named his pain and named Allah\'s mercy, and left the rest to Him.',
      'In Surah Sad: "Shaytan has touched me with hardship and suffering" (38:41).'
    ]],
    ['Strike the ground', [
      ['q', '38:42', 'Strike the ground with your foot: here is cool water to wash in and to drink.'],
      'He struck the ground, and water came out. He washed and drank, and his illness left him.',
      'Allah gave him back his family, and the same again with them, as a mercy and a reminder for people who understand (38:43; 21:84).'
    ]],
    ['Golden locusts', [
      ['h', 'Sahih al-Bukhari 279', 'Once, while Ayyub was bathing, golden locusts began to fall on him, and he started gathering them into his clothes. His Lord called him: "Ayyub, didn\'t I make you rich enough not to need this?" He said: "Yes, by Your might. But I can never have enough of Your blessing."'],
      'Patient in poverty, and grateful in wealth. Allah\'s verdict on him: "We found him patient. What an excellent servant! He always turned back to Us" (38:44).',
      ['t', 'Tafsir Ibn Kathir', 'During his illness Ayyub had sworn to strike his wife a hundred times over something. Allah, out of mercy for her, told him to take a bunch of grass and strike once, so his oath was kept (38:44).']
    ]]
  ],
  wow: [['Golden locusts rained on him, and he said he could never have enough of Allah\'s blessing.', 'Sahih al-Bukhari 279'], ['His test lasted eighteen years.', 'Sahih Ibn Hibban 2898'], ['"What an excellent servant!" is Allah\'s own description of him.', 'Qur\'an 38:44']],
  src: ['Qur\'an, al-Anbiya\' 21:83-84; Sad 38:41-44', 'Sahih al-Bukhari 279', 'Sahih Ibn Hibban 2898', 'Tafsir Ibn Kathir on 38:41-44']
};

})(window.IFM_STORY_X);
