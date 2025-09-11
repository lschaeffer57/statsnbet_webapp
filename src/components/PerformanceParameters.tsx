import { useState } from 'react';

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

const PerformanceParameters = ({
  isOpen,
  setIsOpen,
  showConfiguration = true,
}: PerformanceParametersProps) => {
  const [configuration, setConfiguration] = useState('conf1');
  return (
    <Card className="shadow-glass-lg items-start gap-4">
      {!showConfiguration ? (
        <h2 className="text-foreground text-base font-medium">
          Critères de performances
        </h2>
      ) : (
        <span className="text-foreground/50 text-sm font-normal">
          Critères de performances
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
          Ouvrir les paramètres
        </Button>
        <div
          className={cn(
            'flex gap-2',
            !showConfiguration && !isOpen && 'hidden',
          )}
        >
          <Select value={configuration} onValueChange={setConfiguration}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conf1">Configuration 1</SelectItem>
              <SelectItem value="conf2">Configuration 2</SelectItem>
              <SelectItem value="conf3">Configuration 3</SelectItem>
              <SelectItem value="conf4">Configuration 4</SelectItem>
              <SelectItem value="conf-init">Configuration initiate</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            Réinitialiser
          </Button>
        </div>
      </div>

      <div className="border-border-dashed mt-1 w-full border-b border-dashed" />

      {isOpen && (
        <Tabs defaultValue="criteria" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="criteria">Critères de performance</TabsTrigger>
            <TabsTrigger value="type">Type de paris</TabsTrigger>
          </TabsList>
          <div className="border-border-dashed mt-1 w-full border-b border-dashed" />
          <TabsContent className="text-foreground" value="criteria">
            Critères de performance
          </TabsContent>
          <TabsContent className="text-foreground" value="type">
            Type de paris
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
};

export default PerformanceParameters;
