## Request

This one requests with an aspect filter but also has some specific fieldgroups settings that return refinements at the end of the response

    https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386,Chipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D

## NOTES

Note that one of these comes from the "Video Capture & TV Tuner Cards" (3761) category. In some looking around there are several high end GPUs in that category.

## Response

```json
{
  "href": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D&offset=0",
  "total": 83,
  "next": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D&offset=3",
  "limit": 3,
  "offset": 0,
  "itemSummaries": [
    {
      "itemId": "v1|265708278354|0",
      "title": "Lenovo ThinkSystem NVIDIA Tesla T4 16GB PCIe Passive GPU 4X67A14926 (New Sealed)",
      "leafCategoryIds": ["3761"],
      "categories": [
        {
          "categoryId": "3761",
          "categoryName": "Video Capture & TV Tuner Cards"
        },
        {
          "categoryId": "58058",
          "categoryName": "Computers/Tablets & Networking"
        },
        {
          "categoryId": "175673",
          "categoryName": "Computer Components & Parts"
        }
      ],
      "image": {
        "imageUrl": "https://i.ebayimg.com/thumbs/images/g/AQ4AAOSwJOtijo99/s-l225.jpg"
      },
      "price": {
        "value": "1900.00",
        "currency": "USD"
      },
      "itemHref": "https://api.ebay.com/buy/browse/v1/item/v1%7C265708278354%7C0",
      "seller": {
        "username": "zaadone",
        "feedbackPercentage": "98.0",
        "feedbackScore": 2298
      },
      "condition": "New",
      "conditionId": "1000",
      "thumbnailImages": [
        {
          "imageUrl": "https://i.ebayimg.com/images/g/AQ4AAOSwJOtijo99/s-l640.jpg"
        }
      ],
      "shippingOptions": [
        {
          "shippingCostType": "FIXED",
          "shippingCost": {
            "value": "0.00",
            "currency": "USD"
          }
        }
      ],
      "buyingOptions": ["FIXED_PRICE", "BEST_OFFER"],
      "epid": "23029919952",
      "itemAffiliateWebUrl": "https://www.ebay.com/itm/265708278354?hash=item3ddd729252%3Ag%3AAQ4AAOSwJOtijo99&amdata=enc%3AAQAIAAAA4IzQmmInKXy65Ow40OriAyhDEJZAmvhpRGlUbkw2LLpRirc7cNio4A4952dkeSemZC%2F8EU4wkRus%2FvOYsa%2BPBzWUTJE7kLsw%2B28X1UG665%2Bp%2FmvCUULht7s3OMwvcftSmbZFyXyEOJMxrcZIrvN%2FNGu1FXY23HwglhuNUvpgMNsjSIP4zFlsnphbJUke8hKF3i%2BHPMGc5S%2B8imbN1alw39bNvMwK%2FCQN1C6lb1WIwwlSqahTJjadxikBNzJ7efWderizSPwHN1qC%2FL%2FuEWiGJuJM0xNkbT8y2%2Bp86pio%2FnwK&mkevt=1&mkcid=1&mkrid=711-53200-19255-0&campid=%253CePNCampaignId%253E&customid=%253CreferenceId%253E&toolid=10049",
      "itemWebUrl": "https://www.ebay.com/itm/265708278354?hash=item3ddd729252:g:AQ4AAOSwJOtijo99&amdata=enc%3AAQAIAAAA4IzQmmInKXy65Ow40OriAyhDEJZAmvhpRGlUbkw2LLpRirc7cNio4A4952dkeSemZC%2F8EU4wkRus%2FvOYsa%2BPBzWUTJE7kLsw%2B28X1UG665%2Bp%2FmvCUULht7s3OMwvcftSmbZFyXyEOJMxrcZIrvN%2FNGu1FXY23HwglhuNUvpgMNsjSIP4zFlsnphbJUke8hKF3i%2BHPMGc5S%2B8imbN1alw39bNvMwK%2FCQN1C6lb1WIwwlSqahTJjadxikBNzJ7efWderizSPwHN1qC%2FL%2FuEWiGJuJM0xNkbT8y2%2Bp86pio%2FnwK",
      "itemLocation": {
        "city": "Columbus",
        "postalCode": "432**",
        "country": "US"
      },
      "additionalImages": [
        {
          "imageUrl": "https://i.ebayimg.com/thumbs/images/g/-rAAAOSw7dlijo9-/s-l225.jpg"
        }
      ],
      "adultOnly": false,
      "legacyItemId": "265708278354",
      "availableCoupons": false,
      "itemCreationDate": "2022-05-25T20:22:51.000Z",
      "topRatedBuyingExperience": false,
      "priorityListing": true,
      "listingMarketplaceId": "EBAY_US"
    },
    {
      "itemId": "v1|314845741432|0",
      "title": "Dell NVIDIA Tesla T4 16GB 70W HHHL SW FH PCIe GPU v2 (490-BEYM-OSTK)",
      "leafCategoryIds": ["27386", "164"],
      "categories": [
        {
          "categoryId": "27386",
          "categoryName": "Graphics/Video Cards"
        },
        {
          "categoryId": "164",
          "categoryName": "CPUs/Processors"
        },
        {
          "categoryId": "58058",
          "categoryName": "Computers/Tablets & Networking"
        },
        {
          "categoryId": "175673",
          "categoryName": "Computer Components & Parts"
        }
      ],
      "shortDescription": "Dell NVIDIA Tesla T4 16GB 70W HHHL SW FH PCIe GPU v2 (490-BEYM-OSTK).",
      "image": {
        "imageUrl": "https://i.ebayimg.com/thumbs/images/g/3VoAAOSwuFdlDbqN/s-l225.jpg"
      },
      "price": {
        "value": "1499.00",
        "currency": "USD"
      },
      "itemHref": "https://api.ebay.com/buy/browse/v1/item/v1%7C314845741432%7C0",
      "seller": {
        "username": "xbyte",
        "feedbackPercentage": "100.0",
        "feedbackScore": 4560
      },
      "marketingPrice": {
        "originalPrice": {
          "value": "2999.00",
          "currency": "USD"
        },
        "discountPercentage": "50",
        "discountAmount": {
          "value": "1500.00",
          "currency": "USD"
        },
        "priceTreatment": "LIST_PRICE"
      },
      "condition": "Certified - Refurbished",
      "conditionId": "2000",
      "thumbnailImages": [
        {
          "imageUrl": "https://i.ebayimg.com/images/g/3VoAAOSwuFdlDbqN/s-l1200.jpg"
        }
      ],
      "shippingOptions": [
        {
          "shippingCostType": "FIXED",
          "shippingCost": {
            "value": "0.00",
            "currency": "USD"
          }
        }
      ],
      "buyingOptions": ["FIXED_PRICE", "BEST_OFFER"],
      "itemAffiliateWebUrl": "https://www.ebay.com/itm/314845741432?hash=item494e44c178%3Ag%3A3VoAAOSwuFdlDbqN&amdata=enc%3AAQAIAAAA4N0Z%2BNQCnENMAUetgvMtQ%2Ftz76pCCq7u724eo4fQQXDWflBqonSzmXR4jc9B77f5XCin4iowBUI4jyFm6XWffAWoYzrRd11Hc08k84woiRMx1UA6E1jja22YC9%2BRzXNTnLt0iUvWrFk9PpxCERO0NpNoDs4hiu84EXH%2BNe5X1Bmfh94vxphtaoJkH727M5eXL5TleNz8emL2VjKpejJeKdIa0tm5jnD8wePoY26jXtyPpWD634Q6tHx3PN7XQbU5xE5GBw5ct8rFEUFNR%2BHRhZHr3Wv0k6oQYFbBpHgQ0MKC&mkevt=1&mkcid=1&mkrid=711-53200-19255-0&campid=%253CePNCampaignId%253E&customid=%253CreferenceId%253E&toolid=10049",
      "itemWebUrl": "https://www.ebay.com/itm/314845741432?hash=item494e44c178:g:3VoAAOSwuFdlDbqN&amdata=enc%3AAQAIAAAA4N0Z%2BNQCnENMAUetgvMtQ%2Ftz76pCCq7u724eo4fQQXDWflBqonSzmXR4jc9B77f5XCin4iowBUI4jyFm6XWffAWoYzrRd11Hc08k84woiRMx1UA6E1jja22YC9%2BRzXNTnLt0iUvWrFk9PpxCERO0NpNoDs4hiu84EXH%2BNe5X1Bmfh94vxphtaoJkH727M5eXL5TleNz8emL2VjKpejJeKdIa0tm5jnD8wePoY26jXtyPpWD634Q6tHx3PN7XQbU5xE5GBw5ct8rFEUFNR%2BHRhZHr3Wv0k6oQYFbBpHgQ0MKC",
      "itemLocation": {
        "city": "Bradenton",
        "postalCode": "342**",
        "country": "US"
      },
      "additionalImages": [
        {
          "imageUrl": "https://i.ebayimg.com/thumbs/images/g/8u0AAOSwAaVlDbqN/s-l225.jpg"
        },
        {
          "imageUrl": "https://i.ebayimg.com/thumbs/images/g/Kn0AAOSwA0FlDbqO/s-l225.jpg"
        },
        {
          "imageUrl": "https://i.ebayimg.com/thumbs/images/g/pGsAAOSwi9NlDbqN/s-l225.jpg"
        },
        {
          "imageUrl": "https://i.ebayimg.com/thumbs/images/g/RegAAOSwFLNlDbqO/s-l225.jpg"
        }
      ],
      "adultOnly": false,
      "legacyItemId": "314845741432",
      "availableCoupons": false,
      "itemCreationDate": "2023-09-22T15:57:33.000Z",
      "topRatedBuyingExperience": false,
      "priorityListing": true,
      "listingMarketplaceId": "EBAY_US"
    },
    {
      "itemId": "v1|266484131909|0",
      "title": "Dell NVIDIA Tesla T4 16GB GDDR6 PCI-E 3.0 x16 Graphics Accelerator Card",
      "leafCategoryIds": ["27386"],
      "categories": [
        {
          "categoryId": "27386",
          "categoryName": "Graphics/Video Cards"
        },
        {
          "categoryId": "58058",
          "categoryName": "Computers/Tablets & Networking"
        },
        {
          "categoryId": "175673",
          "categoryName": "Computer Components & Parts"
        }
      ],
      "shortDescription": "Dell Nvidia Tesla T4 16GB GDDR6 Passive Graphics Processing Unit.",
      "image": {
        "imageUrl": "https://i.ebayimg.com/thumbs/images/g/nLUAAOSwk~5lQmpa/s-l225.jpg"
      },
      "price": {
        "value": "1800.00",
        "currency": "USD"
      },
      "itemHref": "https://api.ebay.com/buy/browse/v1/item/v1%7C266484131909%7C0",
      "seller": {
        "username": "jedeh-telecom",
        "feedbackPercentage": "100.0",
        "feedbackScore": 654
      },
      "condition": "New",
      "conditionId": "1000",
      "thumbnailImages": [
        {
          "imageUrl": "https://i.ebayimg.com/images/g/nLUAAOSwk~5lQmpa/s-l1200.jpg"
        }
      ],
      "shippingOptions": [
        {
          "shippingCostType": "FIXED",
          "shippingCost": {
            "value": "12.00",
            "currency": "USD"
          }
        }
      ],
      "buyingOptions": ["FIXED_PRICE"],
      "itemAffiliateWebUrl": "https://www.ebay.com/itm/266484131909?hash=item3e0bb12845%3Ag%3AnLUAAOSwk%7E5lQmpa&amdata=enc%3AAQAIAAAA4KMPN3v7%2FBBrxE1kTEF606gV%2Fo9eoYXG%2FMEIhm2k1Mng88Qyz%2B8mXcns2WqR5w5HmeAnBNqiiNoDN%2F4rdJoSpmMQDm9h%2FpOkoU7Asj87RLL8Bunn6aXyPjVdNT6tXK4Drtnrn7w4sy1GJSdD1Zbe2bbEvTKuG%2BXIIu8%2BXGvDBJIuvCjDpzRaiWwEybIW%2FeOyHbNPPRvSASBT%2FS%2B3Ayk5Tix%2Bs4XNJPHfxfRzHM%2Fsx8EXil3jNxF4wcVNDv6ta95YC4lAtVJkx8UpvwtAUn%2FPzohZbuEsDd8h%2BSRm4rLn9hrT&mkevt=1&mkcid=1&mkrid=711-53200-19255-0&campid=%253CePNCampaignId%253E&customid=%253CreferenceId%253E&toolid=10049",
      "itemWebUrl": "https://www.ebay.com/itm/266484131909?hash=item3e0bb12845:g:nLUAAOSwk~5lQmpa&amdata=enc%3AAQAIAAAA4KMPN3v7%2FBBrxE1kTEF606gV%2Fo9eoYXG%2FMEIhm2k1Mng88Qyz%2B8mXcns2WqR5w5HmeAnBNqiiNoDN%2F4rdJoSpmMQDm9h%2FpOkoU7Asj87RLL8Bunn6aXyPjVdNT6tXK4Drtnrn7w4sy1GJSdD1Zbe2bbEvTKuG%2BXIIu8%2BXGvDBJIuvCjDpzRaiWwEybIW%2FeOyHbNPPRvSASBT%2FS%2B3Ayk5Tix%2Bs4XNJPHfxfRzHM%2Fsx8EXil3jNxF4wcVNDv6ta95YC4lAtVJkx8UpvwtAUn%2FPzohZbuEsDd8h%2BSRm4rLn9hrT",
      "itemLocation": {
        "postalCode": "T3P***",
        "country": "CA"
      },
      "adultOnly": false,
      "legacyItemId": "266484131909",
      "availableCoupons": false,
      "itemCreationDate": "2023-11-01T15:12:33.000Z",
      "topRatedBuyingExperience": false,
      "priorityListing": true,
      "listingMarketplaceId": "EBAY_US"
    }
  ],
  "refinement": {
    "dominantCategoryId": "27386",
    "aspectDistributions": [
      {
        "localizedAspectName": "Memory Size",
        "aspectValueDistributions": [
          {
            "localizedAspectValue": "4 GB",
            "matchCount": 2,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Memory%20Size%3A%7B4%20GB%7D"
          },
          {
            "localizedAspectValue": "8 GB",
            "matchCount": 2,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Memory%20Size%3A%7B8%20GB%7D"
          },
          {
            "localizedAspectValue": "16 GB",
            "matchCount": 47,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Memory%20Size%3A%7B16%20GB%7D"
          },
          {
            "localizedAspectValue": "Not Specified",
            "matchCount": 28,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Memory%20Size%3A%7B!%7D"
          }
        ]
      },
      {
        "localizedAspectName": "Brand",
        "aspectValueDistributions": [
          {
            "localizedAspectValue": "Dell",
            "matchCount": 9,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Brand%3A%7BDell%7D"
          },
          {
            "localizedAspectValue": "HP",
            "matchCount": 3,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Brand%3A%7BHP%7D"
          },
          {
            "localizedAspectValue": "HPE",
            "matchCount": 3,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Brand%3A%7BHPE%7D"
          },
          {
            "localizedAspectValue": "NVIDIA",
            "matchCount": 42,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Brand%3A%7BNVIDIA%7D"
          },
          {
            "localizedAspectValue": "Unbranded",
            "matchCount": 22,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Brand%3A%7BUnbranded%7D"
          }
        ]
      },
      {
        "localizedAspectName": "Memory Type",
        "aspectValueDistributions": [
          {
            "localizedAspectValue": "GDDR5",
            "matchCount": 5,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Memory%20Type%3A%7BGDDR5%7D"
          },
          {
            "localizedAspectValue": "GDDR6",
            "matchCount": 42,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Memory%20Type%3A%7BGDDR6%7D"
          },
          {
            "localizedAspectValue": "DDR6",
            "matchCount": 1,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Memory%20Type%3A%7BDDR6%7D"
          },
          {
            "localizedAspectValue": "Not Specified",
            "matchCount": 32,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Memory%20Type%3A%7B!%7D"
          }
        ]
      },
      {
        "localizedAspectName": "Compatible Slot",
        "aspectValueDistributions": [
          {
            "localizedAspectValue": "PCI",
            "matchCount": 6,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Compatible%20Slot%3A%7BPCI%7D"
          },
          {
            "localizedAspectValue": "PCI Express 3.0 x16",
            "matchCount": 15,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Compatible%20Slot%3A%7BPCI%20Express%203%2E0%20x16%7D"
          },
          {
            "localizedAspectValue": "PCI Express 4.0 x16",
            "matchCount": 13,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Compatible%20Slot%3A%7BPCI%20Express%204%2E0%20x16%7D"
          },
          {
            "localizedAspectValue": "Not Specified",
            "matchCount": 45,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Compatible%20Slot%3A%7B!%7D"
          }
        ]
      },
      {
        "localizedAspectName": "APIs",
        "aspectValueDistributions": [
          {
            "localizedAspectValue": "CUDA",
            "matchCount": 26,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,APIs%3A%7BCUDA%7D"
          },
          {
            "localizedAspectValue": "DirectX 12",
            "matchCount": 2,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,APIs%3A%7BDirectX%2012%7D"
          },
          {
            "localizedAspectValue": "OpenGL 4.5",
            "matchCount": 2,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,APIs%3A%7BOpenGL%204%2E5%7D"
          },
          {
            "localizedAspectValue": "Vulkan",
            "matchCount": 2,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,APIs%3A%7BVulkan%7D"
          },
          {
            "localizedAspectValue": "OpenACC",
            "matchCount": 1,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,APIs%3A%7BOpenACC%7D"
          },
          {
            "localizedAspectValue": "Not Specified",
            "matchCount": 50,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,APIs%3A%7B!%7D"
          }
        ]
      },
      {
        "localizedAspectName": "Chipset/GPU Model",
        "aspectValueDistributions": [
          {
            "localizedAspectValue": "NVIDIA Tesla T4",
            "matchCount": 0,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Chipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D"
          }
        ]
      },
      {
        "localizedAspectName": "Cooling Component Included",
        "aspectValueDistributions": [
          {
            "localizedAspectValue": "Fan with Heatsink",
            "matchCount": 3,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Cooling%20Component%20Included%3A%7BFan%20with%20Heatsink%7D"
          },
          {
            "localizedAspectValue": "Heatsink only",
            "matchCount": 3,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Cooling%20Component%20Included%3A%7BHeatsink%20only%7D"
          },
          {
            "localizedAspectValue": "Not Specified",
            "matchCount": 60,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Cooling%20Component%20Included%3A%7B!%7D"
          }
        ]
      },
      {
        "localizedAspectName": "Chipset Manufacturer",
        "aspectValueDistributions": [
          {
            "localizedAspectValue": "NVIDIA",
            "matchCount": 64,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Chipset%20Manufacturer%3A%7BNVIDIA%7D"
          },
          {
            "localizedAspectValue": "AMD",
            "matchCount": 1,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Chipset%20Manufacturer%3A%7BAMD%7D"
          },
          {
            "localizedAspectValue": "Dell",
            "matchCount": 1,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Chipset%20Manufacturer%3A%7BDell%7D"
          },
          {
            "localizedAspectValue": "Not Specified",
            "matchCount": 14,
            "refinementHref": "https://api.ebay.com/buy/browse/v1/item_summary/search?q=NVIDIA+T4&limit=3&fieldgroups=ASPECT_REFINEMENTS%2CEXTENDED%2CMATCHING_ITEMS&aspect_filter=categoryId%3A27386%2CChipset%2FGPU%20Model%3A%7BNVIDIA%20Tesla%20T4%7D,Chipset%20Manufacturer%3A%7B!%7D"
          }
        ]
      }
    ]
  }
}
```
