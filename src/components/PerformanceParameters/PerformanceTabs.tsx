import { useTranslation } from 'react-i18next';

import { Tabs, TabsTrigger, TabsList, TabsContent } from '../ui/Tabs';

import CriteriaForm from './CriteriaForm';

const PerformanceTabs = () => {
  const { t } = useTranslation('auth');

  return (
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
        <CriteriaForm />
      </TabsContent>
      <TabsContent className="text-foreground" value="type">
        {t('signup.performanceParameters.tabs.betType')}
      </TabsContent>
    </Tabs>
  );
};

export default PerformanceTabs;
