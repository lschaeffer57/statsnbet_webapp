import type { ComponentProps } from 'react';

import { SearchIcon } from '@/assets/icons';

import { Input } from './ui/Input';

const SearchInput = (props: ComponentProps<typeof Input>) => {
  return (
    <Input
      placeholder="Chercher"
      className="!shadow-glass from-muted h-8 bg-gradient-to-b to-transparent opacity-100"
      wrapperClassName="w-[315px]"
      icon={<SearchIcon className="size-[14px]" />}
      {...props}
    />
  );
};

export default SearchInput;
