// Tabs.js
import { useState } from "react";
import Tab from "./Tab";
import TabPanel from "./TabPanel";

export default function Tabs({ tabs }) {
  const [selectedTab, setSelectedTab] = useState(tabs[0].id);

  const handleTabClick = (id) => {
    setSelectedTab(id);
  };

  return (
    <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
      {/* Tab List */}
      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            onClick={handleTabClick}
            isActive={tab.id === selectedTab}
          />
        ))}
      </ul>

      {/* Tab Content */}
      <div id="default-tab-content">
        {tabs.map((tab) => (
          <TabPanel key={tab.id} id={tab.id} isActive={tab.id === selectedTab}>
            {tab.content}
          </TabPanel>
        ))}
      </div>
    </div>
  );
}
