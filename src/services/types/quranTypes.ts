
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  translation?: string;
  audioUrl?: string;
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
}

export interface Bookmark {
  surahNumber: number;
  ayahNumber: number;
}
