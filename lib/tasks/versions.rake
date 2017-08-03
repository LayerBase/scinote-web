namespace :versions do
  ADJECTIVES = {
    'a':
      ['aback', 'abaft', 'abandoned', 'abashed', 'aberrant', 'abhorrent', 'abiding', 'abject', 'ablaze', 'able', 'abnormal', 'aboard', 'aboriginal', 'abortive', 'abounding', 'abrasive', 'abrupt', 'absent', 'absolute', 'absorbed', 'absorbing', 'abstracted', 'absurd', 'abundant', 'abusive', 'academic', 'acceptable', 'accessible', 'accidental', 'acclaimed', 'accomplished', 'accurate', 'aching', 'acid', 'acidic', 'acoustic', 'acrid', 'acrobatic', 'active', 'actual', 'actually', 'ad hoc', 'adamant', 'adaptable', 'addicted', 'adept', 'adhesive', 'adjoining', 'admirable', 'admired', 'adolescent', 'adorable', 'adored', 'advanced', 'adventurous', 'affectionate', 'afraid', 'aged', 'aggravating', 'aggressive', 'agile', 'agitated', 'agonizing', 'agreeable', 'ahead', 'ajar', 'alarmed', 'alarming', 'alcoholic', 'alert', 'alienated', 'alike', 'alive', 'all', 'alleged', 'alluring', 'aloof', 'altruistic', 'amazing', 'ambiguous', 'ambitious', 'amiable', 'ample', 'amuck', 'amused', 'amusing', 'anchored', 'ancient', 'ancient', 'angelic', 'angry', 'angry', 'anguished', 'animated', 'annoyed', 'annoying', 'annual', 'another', 'antique', 'antsy', 'anxious', 'any', 'apathetic', 'appetizing', 'apprehensive', 'appropriate', 'apt', 'aquatic', 'arctic', 'arid', 'aromatic', 'arrogant', 'artistic', 'ashamed', 'aspiring', 'assorted', 'assured', 'astonishing', 'athletic', 'attached', 'attentive', 'attractive', 'auspicious', 'austere', 'authentic', 'authorized', 'automatic', 'available', 'avaricious', 'average', 'awake', 'aware', 'awesome', 'awful', 'awkward', 'axiomatic'],
    'b':
      ['babyish', 'back', 'bad', 'baggy', 'barbarous', 'bare', 'barren', 'bashful', 'basic', 'batty', 'bawdy', 'beautiful', 'beefy', 'befitting', 'belated', 'belligerent', 'beloved', 'beneficial', 'bent', 'berserk', 'best', 'better', 'bewildered', 'bewitched', 'big', 'big-hearted', 'billowy', 'biodegradable', 'bite-sized', 'biting', 'bitter', 'bizarre', 'black', 'black-and-white', 'bland', 'blank', 'blaring', 'bleak', 'blind', 'blissful', 'blond', 'bloody', 'blue', 'blue-eyed', 'blushing', 'bogus', 'boiling', 'bold', 'bony', 'boorish', 'bored', 'boring', 'bossy', 'both', 'bouncy', 'boundless', 'bountiful', 'bowed', 'brainy', 'brash', 'brave', 'brawny', 'breakable', 'breezy', 'brief', 'bright', 'brilliant', 'brisk', 'broad', 'broken', 'bronze', 'brown', 'bruised', 'bubbly', 'bulky', 'bumpy', 'buoyant', 'burdensome', 'burly', 'bustling', 'busy', 'buttery', 'buzzing'],
    'c':
      ['cagey', 'calculating', 'callous', 'calm', 'candid', 'canine', 'capable', 'capital', 'capricious', 'carefree', 'careful', 'careless', 'caring', 'cautious', 'cavernous', 'ceaseless', 'celebrated', 'certain', 'changeable', 'charming', 'cheap', 'cheeky', 'cheerful', 'cheery', 'chemical', 'chief', 'childlike', 'chilly', 'chivalrous', 'chubby', 'chunky', 'circular', 'clammy', 'classic', 'classy', 'clean', 'clear', 'clear-cut', 'clever', 'cloistered', 'close', 'closed', 'cloudy', 'clueless', 'clumsy', 'cluttered', 'coarse', 'coherent', 'cold', 'colorful', 'colorless', 'colossal', 'colossal', 'combative', 'comfortable', 'common', 'compassionate', 'competent', 'complete', 'complex', 'complicated', 'composed', 'concerned', 'concrete', 'condemned', 'condescending', 'confused', 'conscious', 'considerate', 'constant', 'contemplative', 'content', 'conventional', 'convincing', 'convoluted', 'cooing', 'cooked', 'cool', 'cooperative', 'coordinated', 'corny', 'corrupt', 'costly', 'courageous', 'courteous', 'cowardly', 'crabby', 'crafty', 'craven', 'crazy', 'creamy', 'creative', 'creepy', 'criminal', 'crisp', 'critical', 'crooked', 'crowded', 'cruel', 'crushing', 'cuddly', 'cultivated', 'cultured', 'cumbersome', 'curious', 'curly', 'curved', 'curvy', 'cut', 'cute', 'cylindrical', 'cynical'],
    'd':
      ['daffy', 'daily', 'damaged', 'damaging', 'damp', 'dangerous', 'dapper', 'dapper', 'daring', 'dark', 'darling', 'dashing', 'dazzling', 'dead', 'deadly', 'deadpan', 'deafening', 'dear', 'dearest', 'debonair', 'decayed', 'deceitful', 'decent', 'decimal', 'decisive', 'decorous', 'deep', 'deeply', 'defeated', 'defective', 'defenseless', 'defensive', 'defiant', 'deficient', 'definite', 'delayed', 'delectable', 'delicate', 'delicious', 'delightful', 'delirious', 'demanding', 'demonic', 'dense', 'dental', 'dependable', 'dependent', 'depraved', 'depressed', 'deranged', 'descriptive', 'deserted', 'despicable', 'detailed', 'determined', 'devilish', 'devoted', 'didactic', 'different', 'difficult', 'digital', 'dilapidated', 'diligent', 'dim', 'diminutive', 'dimpled', 'dimwitted', 'direct', 'direful', 'dirty', 'disagreeable', 'disastrous', 'discreet', 'discrete', 'disfigured', 'disguised', 'disgusted', 'disgusting', 'dishonest', 'disillusioned', 'disloyal', 'dismal', 'dispensable', 'distant', 'distinct', 'distorted', 'distraught', 'distressed', 'disturbed', 'divergent', 'dizzy', 'domineering', 'dopey', 'doting', 'double', 'doubtful', 'downright', 'drab', 'draconian', 'drafty', 'drained', 'dramatic', 'dreary', 'droopy', 'drunk', 'dry', 'dual', 'dull', 'dull', 'dusty', 'dutiful', 'dynamic', 'dysfunctional'],
    'e':
      ['each', 'eager', 'early', 'earnest', 'earsplitting', 'earthy', 'easy', 'easy-going', 'eatable', 'economic', 'ecstatic', 'edible', 'educated', 'efficacious', 'efficient', 'eight', 'elaborate', 'elastic', 'elated', 'elderly', 'electric', 'elegant', 'elementary', 'elfin', 'elite', 'elliptical', 'emaciated', 'embarrassed', 'embellished', 'eminent', 'emotional', 'empty', 'enchanted', 'enchanting', 'encouraging', 'endurable', 'energetic', 'enlightened', 'enormous', 'enraged', 'entertaining', 'enthusiastic', 'entire', 'envious', 'envious', 'equable', 'equal', 'equatorial', 'erect', 'erratic', 'essential', 'esteemed', 'ethereal', 'ethical', 'euphoric', 'evanescent', 'evasive', 'even', 'evergreen', 'everlasting', 'every', 'evil', 'exalted', 'exasperated', 'excellent', 'excitable', 'excited', 'exciting', 'exclusive', 'exemplary', 'exhausted', 'exhilarated', 'exotic', 'expensive', 'experienced', 'expert', 'extensive', 'extra-large', 'extraneous', 'extra-small', 'extroverted', 'exuberant', 'exultant'],
    'f':
      ['fabulous', 'faded', 'failing', 'faint', 'fair', 'faithful', 'fake', 'fallacious', 'false', 'familiar', 'famous', 'fanatical', 'fancy', 'fantastic', 'far', 'faraway', 'far-flung', 'far-off', 'fascinated', 'fast', 'fat', 'fatal', 'fatherly', 'faulty', 'favorable', 'favorite', 'fearful', 'fearless', 'feeble', 'feigned', 'feisty', 'feline', 'female', 'feminine', 'fertile', 'festive', 'few', 'fickle', 'fierce', 'filthy', 'fine', 'finicky', 'finished', 'firm', 'first', 'firsthand', 'fitting', 'five', 'fixed', 'flagrant', 'flaky', 'flamboyant', 'flashy', 'flat', 'flawed', 'flawless', 'flickering', 'flimsy', 'flippant', 'floppy', 'flowery', 'flufy', 'fluid', 'flustered', 'fluttering', 'foamy', 'focused', 'fond', 'foolhardy', 'foolish', 'forceful', 'foregoing', 'forgetful', 'forked', 'formal', 'forsaken', 'forthright', 'fortunate', 'four', 'fragile', 'fragrant', 'frail', 'frank', 'frantic', 'frayed', 'free', 'freezing', 'French', 'frequent', 'fresh', 'fretful', 'friendly', 'frightened', 'frightening', 'frigid', 'frilly', 'frivolous', 'frizzy', 'front', 'frosty', 'frothy', 'frozen', 'frugal', 'fruitful', 'frustrating', 'full', 'fumbling', 'fumbling', 'functional', 'funny', 'furry', 'furtive', 'fussy', 'future', 'futuristic', 'fuzzy'],
    'g':
      ['gabby', 'gainful', 'gamy', 'gaping', 'gargantuan', 'garrulous', 'gaseous', 'gaudy', 'general', 'general', 'generous', 'gentle', 'genuine', 'ghastly', 'giant', 'giddy', 'gifted', 'gigantic', 'giving', 'glamorous', 'glaring', 'glass', 'gleaming', 'gleeful', 'glib', 'glistening', 'glittering', 'gloomy', 'glorious', 'glossy', 'glum', 'godly', 'golden', 'good', 'good-natured', 'goofy', 'gorgeous', 'graceful', 'gracious', 'grand', 'grandiose', 'grandiose', 'granular', 'grateful', 'gratis', 'grave', 'gray', 'greasy', 'great', 'greedy', 'green', 'gregarious', 'grey', 'grieving', 'grim', 'grimy', 'gripping', 'grizzled', 'groovy', 'gross', 'grotesque', 'grouchy', 'grounded', 'growing', 'growling', 'grown', 'grubby', 'gruesome', 'grumpy', 'guarded', 'guiltless', 'guilty', 'gullible', 'gummy', 'gusty', 'guttural'],
    'h':
      ['habitual', 'hairy', 'half', 'half', 'hallowed', 'halting', 'handmade', 'handsome', 'handsomely', 'handy', 'hanging', 'hapless', 'happy', 'happy-go-lucky', 'hard', 'hard-to-find', 'harebrained', 'harmful', 'harmless', 'harmonious', 'harsh', 'hasty', 'hateful', 'haunting', 'heady', 'healthy', 'heartbreaking', 'heartfelt', 'hearty', 'heavenly', 'heavy', 'hefty', 'hellish', 'helpful', 'helpless', 'hesitant', 'hidden', 'hideous', 'high', 'highfalutin', 'high-level', 'high-pitched', 'hilarious', 'hissing', 'historical', 'hoarse', 'holistic', 'hollow', 'homeless', 'homely', 'honest', 'honorable', 'honored', 'hopeful', 'horrible', 'horrific', 'hospitable', 'hot', 'huge', 'hulking', 'humble', 'humdrum', 'humiliating', 'humming', 'humongous', 'humorous', 'hungry', 'hurried', 'hurt', 'hurtful', 'hushed', 'husky', 'hypnotic', 'hysterical'],
    'i':
      ['icky', 'icy', 'ideal', 'ideal', 'idealistic', 'identical', 'idiotic', 'idle', 'idolized', 'ignorant', 'ill', 'illegal', 'ill-fated', 'ill-informed', 'illiterate', 'illustrious', 'imaginary', 'imaginative', 'immaculate', 'immaterial', 'immediate', 'immense', 'imminent', 'impartial', 'impassioned', 'impeccable', 'imperfect', 'imperturbable', 'impish', 'impolite', 'important', 'imported', 'impossible', 'impractical', 'impressionable', 'impressive', 'improbable', 'impure', 'inborn', 'incandescent', 'incomparable', 'incompatible', 'incompetent', 'incomplete', 'inconclusive', 'inconsequential', 'incredible', 'indelible', 'indolent', 'industrious', 'inexpensive', 'inexperienced', 'infamous', 'infantile', 'infatuated', 'inferior', 'infinite', 'informal', 'innate', 'innocent', 'inquisitive', 'insecure', 'insidious', 'insignificant', 'insistent', 'instinctive', 'instructive', 'insubstantial', 'intelligent', 'intent', 'intentional', 'interesting', 'internal', 'international', 'intrepid', 'intrigued', 'invincible', 'irate', 'ironclad', 'irresponsible', 'irritable', 'irritating', 'itchy'],
    'j':
      ['jaded', 'jagged', 'jam-packed', 'jaunty', 'jazzy', 'jealous', 'jittery', 'jobless', 'joint', 'jolly', 'jovial', 'joyful', 'joyous', 'jubilant', 'judicious', 'juicy', 'jumbled', 'jumbo', 'jumpy', 'jumpy', 'junior', 'juvenile'],
    'k':
      ['kaleidoscopic', 'kaput', 'keen', 'key', 'kind', 'kindhearted', 'kindly', 'klutzy', 'knobby', 'knotty', 'knowing', 'knowledgeable', 'known', 'kooky', 'kosher'],
    'l':
      ['labored', 'lackadaisical', 'lacking', 'lame', 'lame', 'lamentable', 'languid', 'lanky', 'large', 'last', 'lasting', 'late', 'laughable', 'lavish', 'lawful', 'lazy', 'leading', 'leafy', 'lean', 'learned', 'left', 'legal', 'legitimate', 'lethal', 'level', 'lewd', 'light', 'lighthearted', 'likable', 'like', 'likeable', 'likely', 'limited', 'limp', 'limping', 'linear', 'lined', 'liquid', 'literate', 'little', 'live', 'lively', 'livid', 'living', 'loathsome', 'lone', 'lonely', 'long', 'longing', 'long-term', 'loose', 'lopsided', 'lost', 'loud', 'loutish', 'lovable', 'lovely', 'loving', 'low', 'lowly', 'loyal', 'lucky', 'ludicrous', 'lumbering', 'luminous', 'lumpy', 'lush', 'lustrous', 'luxuriant', 'luxurious', 'lying', 'lyrical'],
    'm':
      ['macabre', 'macho', 'mad', 'maddening', 'made-up', 'madly', 'magenta', 'magical', 'magnificent', 'majestic', 'major', 'makeshift', 'male', 'malicious', 'mammoth', 'maniacal', 'many', 'marked', 'married', 'marvelous', 'masculine', 'massive', 'material', 'materialistic', 'mature', 'meager', 'mealy', 'mean', 'measly', 'meaty', 'medical', 'mediocre', 'medium', 'meek', 'melancholy', 'mellow', 'melodic', 'melted', 'memorable', 'menacing', 'merciful', 'mere', 'merry', 'messy', 'metallic', 'mighty', 'mild', 'military', 'milky', 'mindless', 'miniature', 'minor', 'minty', 'minute', 'miscreant', 'miserable', 'miserly', 'misguided', 'mistaken', 'misty', 'mixed', 'moaning', 'modern', 'modest', 'moist', 'moldy', 'momentous', 'monstrous', 'monthly', 'monumental', 'moody', 'moral', 'mortified', 'motherly', 'motionless', 'mountainous', 'muddled', 'muddy', 'muffled', 'multicolored', 'mundane', 'mundane', 'murky', 'mushy', 'musty', 'mute', 'muted', 'mysterious'],
    'n':
      ['naive', 'nappy', 'narrow', 'nasty', 'natural', 'naughty', 'nauseating', 'nautical', 'near', 'neat', 'nebulous', 'necessary', 'needless', 'needy', 'negative', 'neglected', 'negligible', 'neighboring', 'neighborly', 'nervous', 'nervous', 'new', 'next', 'nice', 'nice', 'nifty', 'nimble', 'nine', 'nippy', 'nocturnal', 'noiseless', 'noisy', 'nonchalant', 'nondescript', 'nonsensical', 'nonstop', 'normal', 'nostalgic', 'nosy', 'notable', 'noted', 'noteworthy', 'novel', 'noxious', 'null', 'numb', 'numberless', 'numerous', 'nutritious', 'nutty'],
    'o':
      ['oafish', 'obedient', 'obeisant', 'obese', 'oblivious', 'oblong', 'obnoxious', 'obscene', 'obsequious', 'observant', 'obsolete', 'obtainable', 'obvious', 'occasional', 'oceanic', 'odd', 'oddball', 'offbeat', 'offensive', 'official', 'oily', 'old', 'old-fashioned', 'omniscient', 'one', 'onerous', 'only', 'open', 'opposite', 'optimal', 'optimistic', 'opulent', 'orange', 'orderly', 'ordinary', 'organic', 'original', 'ornate', 'ornery', 'ossified', 'other', 'our', 'outgoing', 'outlandish', 'outlying', 'outrageous', 'outstanding', 'oval', 'overconfident', 'overcooked', 'overdue', 'overjoyed', 'overlooked', 'overrated', 'overt', 'overwrought'],
    'p':
      ['painful', 'painstaking', 'palatable', 'pale', 'paltry', 'panicky', 'panoramic', 'parallel', 'parched', 'parsimonious', 'partial', 'passionate', 'past', 'pastel', 'pastoral', 'pathetic', 'peaceful', 'penitent', 'peppery', 'perfect', 'perfumed', 'periodic', 'perky', 'permissible', 'perpetual', 'perplexed', 'personal', 'pertinent', 'pesky', 'pessimistic', 'petite', 'petty', 'petty', 'phobic', 'phony', 'physical', 'picayune', 'piercing', 'pink', 'piquant', 'pitiful', 'placid', 'plain', 'plaintive', 'plant', 'plastic', 'plausible', 'playful', 'pleasant', 'pleased', 'pleasing', 'plucky', 'plump', 'plush', 'pointed', 'pointless', 'poised', 'polished', 'polite', 'political', 'pompous', 'poor', 'popular', 'portly', 'posh', 'positive', 'possessive', 'possible', 'potable', 'powerful', 'powerless', 'practical', 'precious', 'premium', 'present', 'present', 'prestigious', 'pretty', 'previous', 'pricey', 'prickly', 'primary', 'prime', 'pristine', 'private', 'prize', 'probable', 'productive', 'profitable', 'profuse', 'proper', 'protective', 'proud', 'prudent', 'psychedelic', 'psychotic', 'public', 'puffy', 'pumped', 'punctual', 'pungent', 'puny', 'pure', 'purple', 'purring', 'pushy', 'pushy', 'putrid', 'puzzled', 'puzzling'],
    'q':
      ['quack', 'quaint', 'quaint', 'qualified', 'quarrelsome', 'quarterly', 'queasy', 'querulous', 'questionable', 'quick', 'quickest', 'quick-witted', 'quiet', 'quintessential', 'quirky', 'quixotic', 'quixotic', 'quizzical'],
    'r':
      ['rabid', 'racial', 'radiant', 'ragged', 'rainy', 'rambunctious', 'rampant', 'rapid', 'rare', 'rash', 'raspy', 'ratty', 'raw', 'ready', 'real', 'realistic', 'reasonable', 'rebel', 'recent', 'receptive', 'reckless', 'recondite', 'rectangular', 'red', 'redundant', 'reflecting', 'reflective', 'regal', 'regular', 'reliable', 'relieved', 'remarkable', 'reminiscent', 'remorseful', 'remote', 'repentant', 'repulsive', 'required', 'resolute', 'resonant', 'respectful', 'responsible', 'responsive', 'revolving', 'rewarding', 'rhetorical', 'rich', 'right', 'righteous', 'rightful', 'rigid', 'ringed', 'ripe', 'ritzy', 'roasted', 'robust', 'romantic', 'roomy', 'rosy', 'rotating', 'rotten', 'rotund', 'rough', 'round', 'rowdy', 'royal', 'rubbery', 'ruddy', 'rude', 'rundown', 'runny', 'rural', 'rustic  rusty', 'ruthless'],
    's':
      ['sable', 'sad', 'safe', 'salty', 'same', 'sandy', 'sane', 'sarcastic', 'sardonic', 'sassy', 'satisfied', 'satisfying', 'savory', 'scaly', 'scandalous', 'scant', 'scarce', 'scared', 'scary', 'scattered', 'scented', 'scholarly', 'scientific', 'scintillating', 'scornful', 'scratchy', 'scrawny', 'screeching', 'second', 'secondary', 'second-hand', 'secret', 'secretive', 'sedate', 'seemly', 'selective', 'self-assured', 'selfish', 'self-reliant', 'sentimental', 'separate', 'serene', 'serious', 'serpentine', 'several', 'severe', 'shabby', 'shadowy', 'shady', 'shaggy', 'shaky', 'shallow', 'shameful', 'shameless', 'sharp', 'shimmering', 'shiny', 'shivering', 'shocked', 'shocking', 'shoddy', 'short', 'short-term', 'showy', 'shrill', 'shut', 'shy', 'sick', 'silent', 'silky', 'silly', 'silver', 'similar', 'simple', 'simplistic', 'sincere', 'sinful', 'single', 'six', 'sizzling', 'skeletal', 'skillful', 'skinny', 'sleepy', 'slight', 'slim', 'slimy', 'slippery', 'sloppy', 'slow', 'slushy', 'small', 'smarmy', 'smart', 'smelly', 'smiling', 'smoggy', 'smooth', 'smug', 'snappy', 'snarling', 'sneaky', 'sniveling', 'snobbish', 'snoopy', 'snotty', 'sociable', 'soft', 'soggy', 'solid', 'somber', 'some', 'sophisticated', 'sordid', 'sore', 'sorrowful', 'soulful', 'soupy', 'sour', 'sour', 'Spanish', 'sparkling', 'sparse', 'special', 'specific', 'spectacular', 'speedy', 'spherical', 'spicy', 'spiffy', 'spiky', 'spirited', 'spiritual', 'spiteful', 'splendid', 'spooky', 'spotless', 'spotted', 'spotty', 'spry', 'spurious', 'squalid', 'square', 'squeaky', 'squealing', 'squeamish', 'squiggly', 'stable', 'staid', 'stained', 'staking', 'stale', 'standard', 'standing', 'starchy', 'stark', 'starry', 'statuesque', 'steadfast', 'steady', 'steel', 'steep', 'stereotyped', 'sticky', 'stiff', 'stimulating', 'stingy', 'stormy', 'stout', 'straight', 'strange', 'strict', 'strident', 'striking', 'striped', 'strong', 'studious', 'stunning', 'stunning', 'stupendous', 'stupid', 'sturdy', 'stylish', 'subdued', 'submissive', 'subsequent', 'substantial', 'subtle', 'suburban', 'successful', 'succinct', 'succulent', 'sudden', 'sugary', 'sulky', 'sunny', 'super', 'superb', 'superficial', 'superior', 'supportive', 'supreme', 'sure-footed', 'surprised', 'suspicious', 'svelte', 'swanky', 'sweaty', 'sweet', 'sweltering', 'swift', 'sympathetic', 'symptomatic', 'synonymous'],
    't':
      ['taboo', 'tacit', 'tacky', 'talented', 'talkative', 'tall', 'tame', 'tan', 'tangible', 'tangy', 'tart', 'tasteful', 'tasteless', 'tasty', 'tattered', 'taut', 'tawdry', 'tearful', 'tedious', 'teeming', 'teeny', 'teeny-tiny', 'telling', 'temporary', 'tempting', 'ten', 'tender', 'tense', 'tenuous', 'tepid', 'terrible', 'terrific', 'tested', 'testy', 'thankful', 'that', 'therapeutic', 'these', 'thick', 'thin', 'thinkable', 'third', 'thirsty', 'this', 'thorny', 'thorough', 'those', 'thoughtful', 'thoughtless', 'threadbare', 'threatening', 'three', 'thrifty', 'thundering', 'thunderous', 'tidy', 'tight', 'tightfisted', 'timely', 'tinted', 'tiny', 'tired', 'tiresome', 'toothsome', 'torn', 'torpid', 'total', 'tough', 'towering', 'tragic', 'trained', 'tranquil', 'trashy', 'traumatic', 'treasured', 'tremendous', 'triangular', 'tricky', 'trifling', 'trim', 'trite', 'trivial', 'troubled', 'truculent', 'true', 'trusting', 'trustworthy', 'trusty', 'truthful', 'tubby', 'turbulent', 'twin', 'two', 'typical'],
    'u':
      ['ubiquitous', 'ugliest', 'ugly', 'ultimate', 'ultra', 'unable', 'unaccountable', 'unarmed', 'unaware', 'unbecoming', 'unbiased', 'uncomfortable', 'uncommon', 'unconscious', 'uncovered', 'understated', 'understood', 'undesirable', 'unequal', 'unequaled', 'uneven', 'unfinished', 'unfit', 'unfolded', 'unfortunate', 'unhappy', 'unhealthy', 'uniform', 'unimportant', 'uninterested', 'unique', 'united', 'unkempt', 'unknown', 'unlawful', 'unlined', 'unlucky', 'unnatural', 'unpleasant', 'unrealistic', 'unripe', 'unruly', 'unselfish', 'unsightly', 'unsteady', 'unsuitable', 'unsung', 'untidy', 'untimely', 'untried', 'untrue', 'unused', 'unusual', 'unwelcome', 'unwieldy', 'unwitting', 'unwritten', 'upbeat', 'uppity', 'upright', 'upset', 'uptight', 'urban', 'usable', 'used', 'used', 'useful', 'useless', 'utilized', 'utopian', 'utter', 'uttermost'],
    'v':
      ['vacant', 'vacuous', 'vagabond', 'vague', 'vain', 'valid', 'valuable', 'vapid', 'variable', 'various', 'vast', 'velvety', 'venerated', 'vengeful', 'venomous', 'verdant', 'verifiable', 'versed', 'vexed', 'vibrant', 'vicious', 'victorious', 'vigilant', 'vigorous', 'villainous', 'violent', 'violet', 'virtual', 'virtuous', 'visible', 'vital', 'vivacious', 'vivid', 'voiceless', 'volatile', 'voluminous', 'voracious', 'vulgar'],
    'w':
      ['wacky', 'waggish', 'waiting', 'wakeful', 'wan', 'wandering', 'wanting', 'warlike', 'warm', 'warmhearted', 'warped', 'wary', 'wasteful', 'watchful', 'waterlogged', 'watery', 'wavy', 'weak', 'wealthy', 'weary', 'webbed', 'wee', 'weekly', 'weepy', 'weighty', 'weird', 'welcome', 'well-documented', 'well-groomed', 'well-informed', 'well-lit', 'well-made', 'well-off', 'well-to-do', 'well-worn', 'wet', 'which', 'whimsical', 'whirlwind', 'whispered', 'whispering', 'white', 'whole', 'wholesale', 'whopping', 'wicked', 'wide', 'wide-eyed', 'wiggly', 'wild', 'willing', 'wilted', 'winding', 'windy', 'winged', 'wiry', 'wise', 'wistful', 'witty', 'wobbly', 'woebegone', 'woeful', 'womanly', 'wonderful', 'wooden', 'woozy', 'wordy', 'workable', 'worldly', 'worn', 'worried', 'worrisome', 'worse', 'worst', 'worthless', 'worthwhile', 'worthy', 'wrathful', 'wretched', 'writhing', 'wrong', 'wry'],
    'x':
      ['xenophobic'],
    'y':
      ['yawning', 'yearly', 'yellow', 'yellowish', 'yielding', 'young', 'youthful', 'yummy'],
    'z':
      ['zany', 'zealous', 'zesty', 'zigzag', 'zippy', 'zonked']
  }.freeze
  SCIENTISTS = {
    'a':
      ['Louis Agassiz', 'Maria Gaetana Agnesi', 'Al-Battani', 'Abu Nasr Al-Farabi', 'Jim Al-Khalili', 'Muhammad ibn Musa al-Khwarizmi', 'Mihailo Petrovic Alas', 'Angel Alcala', 'Salim Ali', 'Luis Alvarez', 'Andre Marie Ampère', 'Anaximander', 'Mary Anning', 'Virginia Apgar', 'Archimedes', 'Agnes Arber', 'Aristarchus', 'Aristotle', 'Svante Arrhenius', 'Oswald Avery', 'Amedeo Avogadro', 'Avicenna'],
    'b':
      ['Charles Babbage', 'Francis Bacon', 'Alexander Bain', 'John Logie Baird', 'Joseph Banks', 'Ramon Barba', 'John Bardeen', 'Ibn Battuta', 'William Bayliss', 'George Beadle', 'Arnold Orville Beckman', 'Henri Becquerel', 'Emil Adolf Behring', 'Alexander Graham Bell', 'Emile Berliner', 'Claude Bernard', 'Timothy John Berners-Lee', 'Daniel Bernoulli', 'Jacob Berzelius', 'Henry Bessemer', 'Hans Bethe', 'Homi Jehangir Bhabha', 'Alfred Binet', 'Clarence Birdseye', 'Kristian Birkeland', 'Elizabeth Blackwell', 'Alfred Blalock', 'Katharine Burr Blodgett', 'Franz Boas', 'David Bohm', 'Aage Bohr', 'Niels Bohr', 'Ludwig Boltzmann', 'Max Born', 'Carl Bosch', 'Robert Bosch', 'Jagadish Chandra Bose', 'Satyendra Nath Bose', 'Walther Wilhelm Georg Bothe', 'Robert Boyle', 'Lawrence Bragg', 'Tycho Brahe', 'Brahmagupta', 'Georg Brandt', 'Wernher Von Braun', 'Louis de Broglie', 'Alexander Brongniart', 'Robert Brown', 'Michael E. Brown', 'Lester R. Brown', 'Eduard Buchner', 'William Buckland', 'Georges-Louis Leclerc, Comte de Buffon', 'Robert Bunsen', 'Luther Burbank', 'Jocelyn Bell Burnell', 'Thomas Burnet'],
    'c':
      ['Benjamin Cabrera', 'Santiago Ramon y Cajal', 'Rachel Carson', 'George Washington Carver', 'Henry Cavendish', 'Anders Celsius', 'James Chadwick', 'Subrahmanyan Chandrasekhar', 'Erwin Chargaff', 'Noam Chomsky', 'Steven Chu', 'Leland Clark', 'Arthur Compton', 'Nicolaus Copernicus', 'Gerty Theresa Cori', 'Charles-Augustin de Coulomb', 'Jacques Cousteau', 'Brian Cox', 'Francis Crick', 'Nicholas Culpeper', 'Marie Curie', 'Pierre Curie', 'Georges Cuvier', 'Adalbert Czerny'],
    'd':
      ['Gottlieb Daimler', 'John Dalton', 'James Dwight Dana', 'Charles Darwin', 'Humphry Davy', 'Peter Debye', 'Max Delbruck', 'Jean Andre Deluc', 'René Descartes', 'Rudolf Christian Karl Diesel', 'Paul Dirac', 'Prokop Divis', 'Theodosius Dobzhansky', 'Frank Drake', 'K. Eric Drexler'],
    'e':
      ['Arthur Eddington', 'Thomas Edison', 'Paul Ehrlich', 'Albert Einstein', 'Gertrude Elion', 'Empedocles', 'Eratosthenes', 'Euclid', 'Leonhard Euler'],
    'f':
      ['Michael Faraday', 'Pierre de Fermat', 'Enrico Fermi', 'Richard Feynman', 'Fibonacci – Leonardo of Pisa', 'Emil Fischer', 'Ronald Fisher', 'Alexander Fleming', 'Henry Ford', 'Lee De Forest', 'Dian Fossey', 'Leon Foucault', 'Benjamin Franklin', 'Rosalind Franklin', 'Sigmund Freud'],
    'g':
      ['Galen', 'Galileo Galilei', 'Francis Galton', 'Luigi Galvani', 'George Gamow', 'Carl Friedrich Gauss', 'Murray Gell-Mann', 'Sophie Germain', 'Willard Gibbs', 'William Gilbert', 'Sheldon Lee Glashow', 'Robert Goddard', 'Maria Goeppert-Mayer', 'Jane Goodall', 'Stephen Jay Gould'],
    'h':
      ['Fritz Haber', 'Ernst Haeckel', 'Otto Hahn', 'Albrecht von Haller', 'Edmund Halley', 'Thomas Harriot', 'William Harvey', 'Stephen Hawking', 'Otto Haxel', 'Werner Heisenberg', 'Hermann von Helmholtz', 'Jan Baptist von Helmont', 'Joseph Henry', 'William Herschel', 'Gustav Ludwig Hertz', 'Heinrich Hertz', 'Karl F. Herzfeld', 'Antony Hewish', 'David Hilbert', 'Maurice Hilleman', 'Hipparchus', 'Hippocrates', 'Shintaro Hirase', 'Dorothy Hodgkin', 'Robert Hooke', 'Frederick Gowland Hopkins', 'William Hopkins', 'Grace Murray Hopper', 'Frank Hornby', 'Jack Horner', 'Bernardo Houssay', 'Fred Hoyle', 'Edwin Hubble', 'Alexander von Humboldt', 'Zora Neale Hurston', 'James Hutton', 'Christiaan Huygens'],
    'i':
      ['Ernesto Illy', 'Ernst Ising', 'Keisuke Ito'],
    'j':
      ['Mae Carol Jemison', 'Edward Jenner', 'J. Hans D. Jensen', 'Irene Joliot-Curie', 'James Prescott Joule', 'Percy Lavon Julian'],
    'k':
      ['Michio Kaku', 'Heike Kamerlingh Onnes', 'Friedrich August Kekulé', 'Frances Kelsey', 'Pearl Kendrick', 'Johannes Kepler', 'Abdul Qadeer Khan', 'Omar Khayyam', 'Alfred Kinsey', 'Gustav Kirchoff', 'Robert Koch', 'Emil Kraepelin', 'Thomas Kuhn', 'Stephanie Kwolek'],
    'l':
      ['Jean-Baptiste Lamarck', 'Hedy Lamarr', 'Edwin Herbert Land', 'Karl Landsteiner', 'Pierre-Simon Laplace', 'Max von Laue', 'Antoine Lavoisier', 'Ernest Lawrence', 'Henrietta Leavitt', 'Antonie van Leeuwenhoek', 'Inge Lehmann', 'Gottfried Leibniz', 'Georges Lemaître', 'Leonardo da Vinci', 'Niccolo Leoniceno', 'Aldo Leopold', 'Rita Levi-Montalcini', 'Claude Levi-Strauss', 'Willard Frank Libby', 'Justus von Liebig', 'Carolus Linnaeus', 'Joseph Lister', 'John Locke', 'Hendrik Antoon Lorentz', 'Konrad Lorenz', 'Ada Lovelace', 'Lucretius', 'Charles Lyell', 'Trofim Lysenko'],
    'm':
      ['Ernst Mach', 'Marcello Malpighi', 'Jane Marcet', 'Guglielmo Marconi', 'Lynn Margulis', 'James Clerk Maxwell', 'Ernst Mayr', 'Barbara McClintock', 'Lise Meitner', 'Gregor Mendel', 'Dmitri Mendeleev', 'Franz Mesmer', 'Antonio Meucci', 'Albert Abraham Michelson', 'Thomas Midgeley Jr.', 'Maria Mitchell', 'Mario Molina', 'Thomas Hunt Morgan', 'Henry Moseley'],
    'n':
      ['Ukichiro Nakaya', 'John Napier', 'John Needham', 'John von Neumann', 'Thomas Newcomen', 'Isaac Newton', 'Florence Nightingale', 'Tim Noakes', 'Alfred Nobel', 'Emmy Noether', 'Christiane Nusslein-Volhard', 'Bill Nye'],
    'o':
      ['Hans Christian Oersted', 'Georg Ohm', 'J. Robert Oppenheimer', 'Wilhelm Ostwald'],
    'p':
      ['Blaise Pascal', 'Louis Pasteur', 'Wolfgang Ernst Pauli', 'Linus Pauling', 'Randy Pausch', 'Ivan Pavlov', 'Marguerite Perey', 'Jean Piaget', 'Philippe Pinel', 'Max Planck', 'Pliny the Elder', 'Karl Popper', 'Beatrix Potter', 'Joseph Priestley', 'Claudius Ptolemy', 'Pythagoras'],
    'q':
      ['Harriet Quimby', 'Thabit ibn Qurra'],
    'r':
      ['C. V. Raman', 'Srinivasa Ramanujan', 'William Ramsay', 'John Ray', 'Prafulla Chandra Ray', 'Francesco Redi', 'Sally Ride', 'Bernhard Riemann', 'Wilhelm Röntgen', 'Hermann Rorschach', 'Ronald Ross', 'Ibn Rushd', 'Ernest Rutherford'],
    's':
      ['Carl Sagan', 'Mohammad Abdus Salam', 'Jonas Salk', 'Frederick Sanger', 'Alberto Santos-Dumont', 'Walter Schottky', 'Erwin Schrödinger', 'Theodor Schwann', 'Glenn Seaborg', 'Hans Selye', 'Charles Sherrington', 'Gene Shoemaker', 'Ernst Werner von Siemens', 'George Gaylord Simpson', 'B. F. Skinner', 'William Smith', 'Frederick Soddy', 'Arnold Sommerfeld', 'Nettie Stevens', 'William John Swainson', 'Leo Szilard'],
    't':
      ['Niccolo Tartaglia', 'Edward Teller', 'Nikola Tesla', 'Thales of Miletus', 'Benjamin Thompson', 'J. J. Thomson', 'William Thomson', 'Henry David Thoreau', 'Kip S. Thorne', 'Clyde Tombaugh', 'Evangelista Torricelli', 'Charles Townes', 'Alan Turing', 'Neil deGrasse Tyson'],
    'u':
      ['Harold Urey'],
    'v':
      ['Craig Venter', 'Vladimir Vernadsky', 'Andreas Vesalius', 'Rudolf Virchow', 'Artturi Virtanen', 'Alessandro Volta'],
    'w':
      ['George Wald', 'Alfred Russel Wallace', 'James Watson', 'James Watt', 'Alfred Wegener', 'John Archibald Wheeler', 'Maurice Wilkins', 'Thomas Willis', 'E. O. Wilson', 'Sven Wingqvist', 'Sergei Winogradsky', 'Friedrich Wöhler', 'Wilbur and Orville Wright', 'Wilhelm Wundt'],
    'x':
      [],
    'y':
      ['Chen-Ning Yang'],
    'z':
      ['Ahmed Zewail']
  }.freeze

  desc 'Generate a new release name'
  task generate_release_name: :environment do
    def rand_el(arr)
      arr[rand(arr.count)]
    end

    puts '------------------------------------'
    puts ''
    puts 'sciNote release name generator v0.1 ALPHA'
    puts ''
    puts '------------------------------------'

    puts ''
    puts 'Choose what you would like to do:'
    puts '1) Provide a scientist by yourself'
    puts '2) Randomly choose a scientist from a pre-defined list'
    res = $stdin.gets.strip
    unless res.in?(['', '1', '2'])
      puts 'Invalid parameter, exiting'
      next
    end

    # First, pick scientist name
    if res.in?(['', '1'])
      puts 'Enter full scientist first name (all but surname) ' \
           'in capitalized case'
      first_name = $stdin.gets.strip
      puts 'Enter full scientist surname ' \
           'in capitalized case'
      last_name = $stdin.gets.strip
      key = last_name[0].downcase.to_sym
      full_name = "#{first_name} #{last_name}"
    else
      key = rand_el(SCIENTISTS.keys)
      full_name = rand_el(SCIENTISTS[key])
      last_name = full_name.split(' ')[-1]
      puts "Randomly chosen scientist: #{full_name}"
      puts ''
    end

    # Now, pick adjective
    adjective = rand_el(ADJECTIVES[key])

    puts '------------------------------------'
    puts 'Tadaaaa!'
    puts 'The new release will be named......'
    puts '(waaaaait for iiiiit)'
    puts ''
    puts '##############################################'
    puts " #{adjective.capitalize} #{last_name}"
    puts " (full name: #{full_name})"
    puts '##############################################'

    loop do
      puts ''
      puts 'What would you like to do?'
      puts '(E) Exit'
      puts '(a) generate new adjective'
      puts '(s) generate new random scientist'
      res = $stdin.gets.strip
      unless res.in?(['', 'e', 'E', 'a', 'A', 's', 'S'])
        puts 'Invalid parameter!'
        next
      end

      break if res.in?(['', 'e', 'E'])

      if res.in?(%w(s S))
        key = rand_el(SCIENTISTS.keys)
        full_name = rand_el(SCIENTISTS[key])
        last_name = full_name.split(' ')[-1]
      end

      adjective = rand_el(ADJECTIVES[key])

      puts ''
      puts '##############################################'
      puts " #{adjective.capitalize} #{last_name} "
      puts " (full name: #{full_name})"
      puts '##############################################'
    end
  end
end
