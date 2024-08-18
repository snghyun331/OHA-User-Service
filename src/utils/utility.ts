import { RandomNames } from './randomName';

export const createRandomName = () => {
  const randomIndex = Math.floor(Math.random() * RandomNames.length);
  return RandomNames[randomIndex];
};

export const createNickName = (name: string) => {
  const noSpaceName = name.replace(/(\s*)/g, '');
  const randomNumber = Math.floor(Math.random() * 100) + 10;
  const nickname = `${noSpaceName}${randomNumber}`;
  return nickname;
};
