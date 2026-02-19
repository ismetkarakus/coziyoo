export const sellerPanelLayout = ({
  "type": "View",
  "style": ["container", { "$": "rootBackgroundStyle" }],
  "children": [
    {
      "type": "TouchableWithoutFeedback",
      "condition": "themeExpanded",
      "props": { "onPress": { "$": "handlers.closeTheme" } },
      "children": [{ "type": "View", "style": "themeBackdrop" }]
    },
    {
      "type": "ScrollView",
      "style": "content",
      "props": {
        "showsVerticalScrollIndicator": false,
        "bounces": false,
        "alwaysBounceVertical": false,
        "overScrollMode": "never",
        "contentContainerStyle": { "$": "styles.contentContainer" },
        "stickyHeaderIndices": { "$": "scrollStickyHeaderIndices" }
      },
      "children": [
        {
          "type": "View",
          "style": "statsContainer",
          "children": [
                {
                  "type": "LinearGradient",
                  "style": "heroHeader",
                  "props": {
                    "colors": { "$": "heroGradientColors" },
                    "start": { "x": 0, "y": 0 },
                    "end": { "x": 1, "y": 1 }
                  },
                  "children": [
                    {
                      "type": "View",
                      "style": "heroRow",
                      "children": [
                        {
                          "type": "TouchableOpacity",
                          "style": "heroAvatarButton",
                          "props": {
                            "onPress": { "$": "handlers.openProfile" },
                            "activeOpacity": 0.7
                          },
                          "children": [
                            {
                              "type": "Image",
                              "style": ["heroAvatar", { "$": "statsAvatarBorderStyle" }],
                              "props": {
                                "source": { "uri": { "$": "profileData.avatar" } },
                                "defaultSource": { "$": "defaultAvatarSource" }
                              }
                            }
                          ]
                        },
                        {
                          "type": "View",
                          "style": "heroCenter",
                          "children": [
                            {
                              "type": "Text",
                              "style": "heroName",
                              "props": { "variant": "subheading", "weight": "semibold", "color": "text" },
                              "text": { "$": "sellerFullName" }
                            },
                            {
                              "type": "Text",
                              "style": "heroHandle",
                              "props": { "variant": "caption", "weight": "medium", "color": "textSecondary" },
                              "text": { "$": "sellerHandle" }
                            }
                          ]
                        },
                        {
                          "type": "View",
                          "style": "heroRight",
                          "children": [
                            {
                              "type": "TouchableOpacity",
                              "style": ["editProfileButton", { "$": "editProfileButtonStyle" }],
                              "props": { "onPress": { "$": "handlers.openProfile" }, "activeOpacity": 0.7 },
                              "children": [
                                {
                                  "type": "MaterialIcons",
                                  "props": {
                                    "name": "edit",
                                    "size": 16,
                                    "color": { "$": "editProfileIconColor" }
                                  }
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  "type": "View",
                  "style": "statsGrid",
                  "children": [
                    {
                      "type": "TouchableOpacity",
                      "style": "statCard",
                      "props": {
                        "onPress": { "$fn": "handlers.openOrders" },
                        "activeOpacity": 0.8
                      },
                      "children": [
                        {
                          "type": "Card",
                          "props": { "variant": "default", "padding": "sm", "style": { "$": "styles.compactCard" } },
                          "children": [
                            {
                              "type": "Text",
                              "props": {
                                "variant": "title",
                                "weight": "bold",
                                "color": "primary",
                                "center": true,
                                "size": "xl",
                                "numberOfLines": 1,
                                "adjustsFontSizeToFit": true,
                                "minimumFontScale": 0.7
                              },
                              "text": { "$": "stats.orders" }
                            },
                            {
                              "type": "Text",
                              "props": { "variant": "caption", "center": true, "color": "textSecondary" },
                              "text": { "$": "panel.statsLabels.orders" }
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "type": "TouchableOpacity",
                      "style": "statCard",
                      "props": {
                        "onPress": { "$fn": "handlers.openWallet" },
                        "activeOpacity": 0.8
                      },
                      "children": [
                        {
                          "type": "Card",
                          "props": { "variant": "default", "padding": "sm", "style": { "$": "styles.compactCard" } },
                          "children": [
                            {
                              "type": "Text",
                              "props": {
                                "variant": "title",
                                "weight": "bold",
                                "color": "success",
                                "center": true,
                                "size": "xl",
                                "numberOfLines": 1,
                                "adjustsFontSizeToFit": true,
                                "minimumFontScale": 0.7
                              },
                              "text": { "$": "stats.wallet" }
                            },
                            {
                              "type": "Text",
                              "props": { "variant": "caption", "center": true, "color": "textSecondary" },
                              "text": { "$": "panel.statsLabels.wallet" }
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "type": "TouchableOpacity",
                      "style": "statCard",
                      "props": {
                        "onPress": { "$fn": "handlers.openMessages" },
                        "activeOpacity": 0.8
                      },
                      "children": [
                        {
                          "type": "Card",
                          "props": { "variant": "default", "padding": "sm", "style": { "$": "styles.compactCard" } },
                          "children": [
                            {
                              "type": "Text",
                              "props": {
                                "variant": "title",
                                "weight": "bold",
                                "color": "info",
                                "center": true,
                                "size": "xl",
                                "numberOfLines": 1,
                                "adjustsFontSizeToFit": true,
                                "minimumFontScale": 0.7
                              },
                              "text": { "$": "stats.messages" }
                            },
                            {
                              "type": "Text",
                              "props": { "variant": "caption", "center": true, "color": "textSecondary" },
                              "text": { "$": "panel.statsLabels.messages" }
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "type": "TouchableOpacity",
                      "style": "statCard",
                      "props": {
                        "onPress": { "$fn": "handlers.openRatings" },
                        "activeOpacity": 0.8
                      },
                      "children": [
                        {
                          "type": "Card",
                          "props": { "variant": "default", "padding": "sm", "style": { "$": "styles.compactCard" } },
                          "children": [
                            {
                              "type": "Text",
                              "props": {
                                "variant": "title",
                                "weight": "bold",
                                "color": "warning",
                                "center": true,
                                "size": "xl",
                                "numberOfLines": 1,
                                "adjustsFontSizeToFit": true,
                                "minimumFontScale": 0.7
                              },
                              "text": { "$": "stats.rating" }
                            },
                            {
                              "type": "View",
                              "style": "heroStars",
                              "children": [
                                {
                                  "type": "MaterialIcons",
                                  "repeat": { "data": "ratingStars", "itemName": "star", "key": "id" },
                                  "props": {
                                    "name": { "$": "star.name" },
                                    "size": 14,
                                    "color": { "$": "star.color" }
                                  }
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
        },
        {
          "type": "View",
          "condition": "showManageMeals",
          "style": "manageMealsEmbed",
          "children": [
            { "type": "ManageMeals", "props": { "embedded": true } }
          ]
        },
        {
          "type": "TouchableWithoutFeedback",
          "condition": "hasVisibleMenuItems",
          "children": [
            {
              "type": "View",
              "style": "menuSectionsContainer",
              "children": [
                {
                  "type": "TouchableOpacity",
                  "repeat": { "data": "visibleMenuItems", "itemName": "item", "key": "id" },
                  "style": { "$fn": "menuCardStyle", "args": [{ "$": "item" }] },
                  "props": {
                    "onPress": { "$fn": "handlers.onMenuItemPress", "args": [{ "$": "item" }] },
                    "activeOpacity": { "$fn": "menuCardActiveOpacity" }
                  },
                  "children": [
                    {
                      "type": "View",
                      "style": "menuCardContent",
                      "children": [
                        {
                          "type": "Text",
                          "style": { "$fn": "menuCardIconStyle" },
                          "text": { "$fn": "menuCardIconText", "args": [{ "$": "item" }] }
                        },
                        {
                          "type": "View",
                          "style": "menuCardTextContainer",
                          "children": [
                            {
                              "type": "View",
                              "condition": "item.isManageMeals",
                              "style": "menuSummaryRow",
                              "children": [
                                {
                                  "type": "View",
                                  "style": "menuSummaryItem",
                                  "children": [
                                    {
                                      "type": "MaterialIcons",
                                      "props": { "name": "person", "size": 12, "color": "white" }
                                    },
                                    {
                                      "type": "Text",
                                      "style": "menuSummaryText",
                                      "text": { "$": "manageMealsSummary.orders" }
                                    }
                                  ]
                                },
                                {
                                  "type": "View",
                                  "style": "menuSummaryItem",
                                  "children": [
                                    {
                                      "type": "MaterialIcons",
                                      "props": { "name": "money", "size": 12, "color": "white" }
                                    },
                                    {
                                      "type": "Text",
                                      "style": "menuSummaryText",
                                      "text": { "$": "manageMealsSummary.earnings" }
                                    }
                                  ]
                                },
                                {
                                  "type": "View",
                                  "style": "menuSummaryItem",
                                  "children": [
                                    {
                                      "type": "MaterialIcons",
                                      "props": { "name": "star", "size": 12, "color": "white" }
                                    },
                                    {
                                      "type": "Text",
                                      "style": "menuSummaryText",
                                      "text": { "$": "manageMealsSummary.change" }
                                    }
                                  ]
                                }
                              ]
                            },
                            {
                              "type": "Text",
                              "props": { "variant": "subheading", "weight": "semibold" },
                              "style": { "$fn": "menuCardTitleStyle" },
                              "text": { "$": "item.title" }
                            },
                            {
                              "type": "Text",
                              "props": { "variant": "caption" },
                              "style": { "$fn": "menuCardDescriptionStyle" },
                              "text": { "$fn": "menuCardDescriptionText", "args": [{ "$": "item" }] }
                            }
                          ]
                        },
                        {
                          "type": "Text",
                          "style": { "$fn": "menuCardArrowStyle" },
                          "text": { "$fn": "menuCardArrowText" }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        { "type": "View", "style": "bottomSpace" }
      ]
    }
  ]
}) as const;
export default sellerPanelLayout;
