import { addFilter } from "@wordpress/hooks";
import { InspectorControls } from "@wordpress/block-editor";
import {
  PanelBody,
  RangeControl,
  __experimentalUnitControl as UnitControl,
  Button,
  TabPanel,
  __experimentalVStack as VStack,
  __experimentalHStack as HStack,
  Icon,
} from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { desktop, tablet, mobile } from "@wordpress/icons";
import * as React from "react";
import './style.scss';

// @ts-ignore
const wp = (window as any).wp;

const spacingPresets = [
  { label: "None", value: "0px" },
  { label: "2x Small", value: "0.125rem" },
  { label: "X Small", value: "0.25rem" },
  { label: "Small", value: "0.5rem" },
  { label: "Medium", value: "1rem" },
  { label: "Large", value: "2rem" },
  { label: "X Large", value: "4rem" },
  { label: "2x Large", value: "8rem" },
];
const presetValues = spacingPresets.map((p) => p.value);

type Side = "top" | "right" | "bottom" | "left";
type SideValues = Record<Side, string>;

// Enhanced responsive spacing control with breakpoint tabs
function ResponsiveSpacingControl({
  label,
  type, // 'padding' or 'margin'
  desktopValue,
  tabletValue,
  mobileValue,
  onDesktopChange,
  onTabletChange,
  onMobileChange,
}: {
  label: string;
  type: 'padding' | 'margin';
  desktopValue?: Partial<SideValues>;
  tabletValue?: Partial<SideValues>;
  mobileValue?: Partial<SideValues>;
  onDesktopChange: (v: SideValues) => void;
  onTabletChange: (v: SideValues) => void;
  onMobileChange: (v: SideValues) => void;
}) {
  const [activeTab, setActiveTab] = React.useState('desktop');

  const createSpacingPanel = (
    breakpoint: 'desktop' | 'tablet' | 'mobile',
    value: Partial<SideValues> | undefined,
    onChange: (v: SideValues) => void
  ) => {
    const [sideValues, setSideValues] = React.useState<SideValues>({
      top: value?.top || "0px",
      right: value?.right || "0px",
      bottom: value?.bottom || "0px",
      left: value?.left || "0px",
    });
    
    // Check if values are actually linked (all sides have the same value)
    const detectLinkedState = (values: SideValues) => {
      return values.top === values.right && 
             values.right === values.bottom && 
             values.bottom === values.left;
    };
    
    const [isLinked, setIsLinked] = React.useState(() => {
      const initialValues = {
        top: value?.top || "0px",
        right: value?.right || "0px",
        bottom: value?.bottom || "0px",
        left: value?.left || "0px",
      };
      return detectLinkedState(initialValues);
    });

    React.useEffect(() => {
      onChange(sideValues);
    }, [sideValues]);

    const handleCustomChange = (side: Side, v: string) => {
      // Validate negative values - only allow negative values for margin
      if (type === 'padding' && v && parseFloat(v) < 0) {
        // Don't allow negative padding, reset to 0
        setSideValues((prev) => ({ ...prev, [side]: '0px' }));
        return;
      }
      setSideValues((prev) => ({ ...prev, [side]: v }));
    };

    const handleLinkedChange = (v: string) => {
      // Validate negative values - only allow negative values for margin
      if (type === 'padding' && v && parseFloat(v) < 0) {
        // Don't allow negative padding, reset to 0
        setSideValues({
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        });
        return;
      }
      setSideValues({
        top: v,
        right: v,
        bottom: v,
        left: v,
      });
    };

    const handlePresetClick = (presetValue: string) => {
      if (isLinked) {
        handleLinkedChange(presetValue);
      } else {
        // Apply to all sides when using presets even if unlinked
        setSideValues({
          top: presetValue,
          right: presetValue,
          bottom: presetValue,
          left: presetValue,
        });
      }
    };

    return (
      <VStack spacing={3}>
        {/* Link/Unlink toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            size="small"
            variant={isLinked ? "primary" : "secondary"}
            onClick={() => setIsLinked(!isLinked)}
            style={{ fontSize: 11 }}
          >
            {isLinked ? "🔗 Linked" : "🔓 Individual"}
          </Button>
          <span style={{ fontSize: 11, color: '#757575' }}>
            {isLinked ? "All sides together" : "Control each side separately"}
          </span>
        </div>

        {/* Quick Presets */}
        <div>
          <div style={{ fontSize: 12, marginBottom: 8 }}>Quick Presets:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {spacingPresets.map((preset, i) => (
              <Button
                key={preset.value}
                size="small"
                variant="secondary"
                onClick={() => handlePresetClick(preset.value)}
                style={{ fontSize: 11 }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Spacing Controls */}
        {isLinked ? (
          // Linked mode - single control for all sides
          <div>
            <div style={{ fontSize: 12, marginBottom: 4 }}>
              All sides {breakpoint !== 'desktop' && `(${breakpoint})`}
              {type === 'padding' && (
                <span style={{ color: '#666', fontSize: 11, marginLeft: 8 }}>
                  (negative values not allowed)
                </span>
              )}
            </div>
            <UnitControl
              value={sideValues.top}
              onChange={(v) => handleLinkedChange(v ?? "0px")}
              units={[
                { value: "px", label: "px" },
                { value: "em", label: "em" },
                { value: "rem", label: "rem" },
                { value: "%", label: "%" },
                { value: "vh", label: "vh" },
                { value: "vw", label: "vw" },
              ]}
              size="default"
              min={type === 'padding' ? 0 : undefined}
            />
          </div>
        ) : (
          // Individual mode - separate controls for each side
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {type === 'padding' && (
              <div style={{ gridColumn: "1 / -1", fontSize: 11, color: '#666', marginBottom: 4 }}>
                Note: Negative padding values are not allowed in CSS
              </div>
            )}
            {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
              <div key={side}>
                <div style={{ fontSize: 12, marginBottom: 4, textTransform: 'capitalize' }}>
                  {side} {breakpoint !== 'desktop' && `(${breakpoint})`}
                </div>
                <UnitControl
                  value={sideValues[side]}
                  onChange={(v) => handleCustomChange(side, v ?? "0px")}
                  units={[
                    { value: "px", label: "px" },
                    { value: "em", label: "em" },
                    { value: "rem", label: "rem" },
                    { value: "%", label: "%" },
                    { value: "vh", label: "vh" },
                    { value: "vw", label: "vw" },
                  ]}
                  size="small"
                  min={type === 'padding' ? 0 : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </VStack>
    );
  };

  const tabs = [
    {
      name: 'desktop',
      title: 'Desktop',
      icon: desktop,
      content: createSpacingPanel('desktop', desktopValue, onDesktopChange)
    },
    {
      name: 'tablet',
      title: 'Tablet',
      icon: tablet,
      content: createSpacingPanel('tablet', tabletValue, onTabletChange)
    },
    {
      name: 'mobile',
      title: 'Mobile',
      icon: mobile,
      content: createSpacingPanel('mobile', mobileValue, onMobileChange)
    }
  ];

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 500, marginBottom: 8 }}>{label}</div>
      
      <TabPanel
        className="responsive-spacing-tabs"
        activeClass="is-active"
        tabs={tabs.map(tab => ({
          name: tab.name,
          title: tab.title // Use only string here
        }))}
      >
        {(tab) => {
          const selectedTab = tabs.find(t => t.name === tab.name);
          return selectedTab ? (
            <div>
              {/* Header row with icon and title */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                marginBottom: 16,
                padding: '8px 0',
                borderBottom: '1px solid #e0e0e0',
                fontSize: 14,
                fontWeight: 500
              }}>
                <Icon icon={selectedTab.icon} style={{ width: '30px', height: '30px' }} />
                <span>{selectedTab.title}</span>
              </div>
              
              {/* Content below in full width */}
              <div>
                {selectedTab.content}
              </div>
            </div>
          ) : null;
        }}
      </TabPanel>
    </div>
  );
}

function addResponsiveSpacingControls(BlockEdit: any) {
  return (props: any) => {
    if (!props.isSelected) return <BlockEdit {...props} />;
    
    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls group="styles">
          <PanelBody 
            title="Responsive Spacing" 
            initialOpen={false}
            icon={<Icon icon={tablet} style={{ width: '20px', height: '20px' }} />}
            className="responsive-spacing-panel"
          >
            <div className="responsive-spacing-controls">
              <div style={{ marginBottom: 12, fontSize: 13, color: '#666' }}>
                Set different spacing values for desktop, tablet, and mobile devices.
              </div>
              <ResponsiveSpacingControl
                label="Padding"
                type="padding"
                desktopValue={props.attributes.desktopPadding}
                tabletValue={props.attributes.tabletPadding}
                mobileValue={props.attributes.mobilePadding}
                onDesktopChange={(v) => props.setAttributes({ desktopPadding: v })}
                onTabletChange={(v) => props.setAttributes({ tabletPadding: v })}
                onMobileChange={(v) => props.setAttributes({ mobilePadding: v })}
              />
              <ResponsiveSpacingControl
                label="Margin"
                type="margin"
                desktopValue={props.attributes.desktopMargin}
                tabletValue={props.attributes.tabletMargin}
                mobileValue={props.attributes.mobileMargin}
                onDesktopChange={(v) => props.setAttributes({ desktopMargin: v })}
                onTabletChange={(v) => props.setAttributes({ tabletMargin: v })}
                onMobileChange={(v) => props.setAttributes({ mobileMargin: v })}
              />
            </div>
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}

addFilter(
  "editor.BlockEdit",
  "responsive-spacing-controls/add-responsive-spacing-controls",
  addResponsiveSpacingControls
);

addFilter(
  "blocks.getSaveContent.extraProps",
  "responsive-spacing-controls/add-responsive-spacing-classes",
  (extraProps: any, blockType: any, attributes: any) => {
    let classNames = extraProps.className || "";
    
    // Remove all existing responsive spacing classes
    classNames = (classNames as string)
      .split(" ")
      .filter(
        (cls: string) =>
          !/^(desktop|tablet|mobile)-(pt|mg|pa|ma)-(top|right|bottom|left)-/.test(cls)
      )
      .join(" ");

    // Function to create safe class name from value (same as PHP)
    const createClassName = (value: string) => {
      // Normalize comma decimal separator to dot, then replace decimal point with 'dot' and remove other special chars
      const normalizedValue = value.replace(',', '.');
      return normalizedValue.replace('.', 'dot').replace(/[^a-zA-Z0-9]/g, '');
    };

    // Add responsive spacing classes
    const breakpoints = [
      { prefix: 'desktop', data: attributes.desktopPadding, type: 'pt' },
      { prefix: 'desktop', data: attributes.desktopMargin, type: 'mg' },
      { prefix: 'tablet', data: attributes.tabletPadding, type: 'pt' },
      { prefix: 'tablet', data: attributes.tabletMargin, type: 'mg' },
      { prefix: 'mobile', data: attributes.mobilePadding, type: 'pt' },
      { prefix: 'mobile', data: attributes.mobileMargin, type: 'mg' },
    ];

    breakpoints.forEach(({ prefix, data, type }) => {
      if (data && typeof data === "object") {
        ["top", "right", "bottom", "left"].forEach((side) => {
          if (data[side] && data[side] !== '0px') {
            const className = `${prefix}-${type}-${side}-${createClassName(data[side])}`;
            if (!classNames.includes(className)) {
              classNames += ` ${className}`;
            }
          }
        });
      }
    });

    extraProps.className = classNames.trim();
    return extraProps;
  }
);

// Register custom attributes for all blocks
addFilter(
  'blocks.registerBlockType',
  'responsive-spacing-controls/add-responsive-spacing-attributes',
  (settings) => {
    // Add responsive spacing attributes to ALL blocks
    return {
      ...settings,
      attributes: {
        ...settings.attributes,
        desktopPadding: {
          type: 'object',
          default: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        },
        tabletPadding: {
          type: 'object',
          default: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        },
        mobilePadding: {
          type: 'object',
          default: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        },
        desktopMargin: {
          type: 'object',
          default: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        },
        tabletMargin: {
          type: 'object',
          default: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        },
        mobileMargin: {
          type: 'object',
          default: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        }
      }
    };
  }
);
