export const useArguments = () => {
  const get = <T = any>(key: string, defaultValue: T, aliases: string[] = []): T => {
    const index = process.argv.indexOf(key);
    if (index !== -1) {
      const nextValue = process.argv[index + 1];
      if (nextValue.startsWith("-")) return defaultValue;

      return process.argv[index + 1] as T;
    }

    for (const alias of aliases)
      if (process.argv.includes(alias)) {
        const index = process.argv.indexOf(alias);
        const nextValue = process.argv[index + 1];
        if (nextValue.startsWith("-")) return defaultValue;

        return process.argv[index + 1] as T;
      }

    return defaultValue;
  };

  const includes = (key: string, aliases: string[] = []) => {
    return process.argv.includes(key) || aliases.some((alias) => process.argv.includes(alias));
  };

  return {
    get,
    includes,
  };
};
