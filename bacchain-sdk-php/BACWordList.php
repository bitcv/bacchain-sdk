<?php
namespace BACChain\SDK;
 
use BitWasp\Bitcoin\Mnemonic\WordList;
use BitWasp\Bitcoin\Mnemonic\Bip39\Bip39WordListInterface;
/**
 * Class BIP39EnglishWordList
 *  word list as defined here: https://github.com/bitcoin/bips/blob/master/bip-0039/english.txt
 *
 * @package BitWasp\BitcoinLib\BIP39
 */
class BACWordList extends WordList  implements Bip39WordListInterface
{

    protected $wordsFlipped;
    protected $words;

    const SEED_WORD_FILE = "wordlist.json";

    function __construct()
    {
        $filename = __DIR__."/".self::SEED_WORD_FILE;

        $this->words = json_decode(file_get_contents($filename));
    }
    
    public function getWords() : array
    {
        return $this->words;
    }

    public function getWord(int $idx) : string
    {
        if (!isset($this->words)) {
            throw new \Exception(__CLASS__ . " does not contain a word for index [{$idx}]");
        }

        return $this->words[$idx];
    }

    public function getIndex(string $word) : int
    {
        // create a flipped word list to speed up the searching of words
        if (is_null($this->wordsFlipped)) {
            $this->wordsFlipped = array_flip($this->words);
        }

        if (!isset($this->wordsFlipped[$word])) {
            throw new \Exception(__CLASS__ . " does not contain word  [{$word}]");
        }

        return $this->wordsFlipped[$word];
    }

    public function count()
    {
        return count($this->worlds);
    }

}
