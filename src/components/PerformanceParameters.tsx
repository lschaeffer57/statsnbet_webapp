import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChevronDownIcon } from '@/assets/icons';
import { cn } from '@/lib/utils';

import { Button } from './ui/Button';
import { Card } from './ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';

interface PerformanceParametersProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  showConfiguration?: boolean;
}

export const PerformanceParameters = ({
  isOpen,
  setIsOpen,
  showConfiguration = true,
}: PerformanceParametersProps) => {
  const [configuration, setConfiguration] = useState('conf1');
  const { t } = useTranslation('auth');

  return (
    <Card className="shadow-glass-lg items-start gap-4">
      {!showConfiguration ? (
        <h2 className="text-foreground text-base font-medium">
          {t('signup.performanceParameters.title')}
        </h2>
      ) : (
        <span className="text-foreground/50 text-sm font-normal">
          {t('signup.performanceParameters.title')}
        </span>
      )}
      <div className="flex w-full justify-between">
        <Button
          variant="secondary"
          size="sm"
          iconRight={<ChevronDownIcon className="size-3.5" />}
          className="shadow-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {t('signup.performanceParameters.openSettings')}
        </Button>
        <div
          className={cn(
            'flex gap-2',
            !showConfiguration && !isOpen && 'hidden',
          )}
        >
          <Select value={configuration} onValueChange={setConfiguration}>
            <SelectTrigger size="sm">
              <SelectValue
                placeholder={t(
                  'signup.performanceParameters.selectPlaceholder',
                )}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conf1">
                {t('signup.performanceParameters.configurations.conf1')}
              </SelectItem>
              <SelectItem value="conf2">
                {t('signup.performanceParameters.configurations.conf2')}
              </SelectItem>
              <SelectItem value="conf3">
                {t('signup.performanceParameters.configurations.conf3')}
              </SelectItem>
              <SelectItem value="conf4">
                {t('signup.performanceParameters.configurations.conf4')}
              </SelectItem>
              <SelectItem value="conf-init">
                {t('signup.performanceParameters.configurations.confInit')}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            {t('signup.performanceParameters.reset')}
          </Button>
        </div>
      </div>

      <div className="border-border-dashed mt-1 w-full border-b border-dashed" />

      {isOpen && (
        <Tabs defaultValue="criteria" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="criteria">
              {t('signup.performanceParameters.tabs.criteria')}
            </TabsTrigger>
            <TabsTrigger value="type">
              {t('signup.performanceParameters.tabs.betType')}
            </TabsTrigger>
          </TabsList>
          <div className="border-border-dashed mt-1 w-full border-b border-dashed" />
          <TabsContent className="text-foreground" value="criteria">
            {t('signup.performanceParameters.tabs.criteria')}
          </TabsContent>
          <TabsContent className="text-foreground" value="type">
            {t('signup.performanceParameters.tabs.betType')}
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
};
