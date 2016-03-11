;'use strict';

var app = app || {};

(function (app) {

    app.successCode = 200;
    app.requestMethod = "GET";

    app.context = SP.ClientContext.get_current();
    app.web = app.context.get_web();
    app.user = app.web.get_currentUser();
    app.lists = app.web.get_lists();

    var hostWebUrl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
    app.hostContext = new SP.AppContextSite(app.context, hostWebUrl);

    var viewModel = {
        rows: ko.observableArray()
    };

    viewModel.total = ko.computed(function () {
        return this.rows.length;
    }, viewModel);

    ko.applyBindings(viewModel);

    app.fields = {
        supplier: {
            id: "SupplierID",
            companyName: "CompanyName"
        },
        product: {
            id: "ProductID",
            name: "ProductName",
            supplierId: "SupplierID",
            categoryId: "CategoryID"
        },
        category: {
            id: "CategoryID",
            name: "CategoryName"
        },
        review: {
            companyName: "CompanyName",
            productName: "ProductName"
        }
    };

    app.listNames = {
        product: 'Product',
        category: 'Category',
        supplier: 'Supplier',
        review: 'Review'
    }

    app.url = {
        product: "http://services.odata.org/V4/Northwind/Northwind.svc/Products",
        category: "http://services.odata.org/V4/Northwind/Northwind.svc/Categories",
        supplier: "http://services.odata.org/V4/Northwind/Northwind.svc/Suppliers"
    }

    app.data = {};
    app.data[app.listNames.product] = [];
    app.data[app.listNames.category] = [];
    app.data[app.listNames.supplier] = [];

    app.init = function () {
        loadSPObjects();

        var scope = new SP.ExceptionHandlingScope(app.context);
        var scopeStart = scope.startScope();

        var scopeTry = scope.startTry();
        var reviewList = app.hostContext.get_web().get_lists().getByTitle(app.listNames.review);
        scopeTry.dispose();

        var scopeCatch = scope.startCatch();
        createReviewList();
        scopeCatch.dispose();

        var scopeFinally = scope.startFinally();
        app.context.load(app.hostContext.get_web().get_lists().getByTitle(app.listNames.review));
        scopeFinally.dispose();

        scopeStart.dispose();
        execute(
            function sucess(sender, args) {
                createAppWebLists();
            },
            function fail(sender, args) {
                console.log("App initialization failed");
            });

    }

    function createAppWebLists() {
        var scope = new SP.ExceptionHandlingScope(app.context);
        var scopeStart = scope.startScope();

        var scopeTry = scope.startTry();
        var productList = app.lists.getByTitle(app.listNames.product);
        scopeTry.dispose();

        var scopeCatch = scope.startCatch();
        createCategoryList();
        createSupplierList();
        createProductList();
        scopeCatch.dispose();

        var scopeFinally = scope.startFinally();
        app.context.load(app.lists.getByTitle(app.listNames.product));
        scopeFinally.dispose();

        scopeStart.dispose();
        execute(
            function sucess(sender, args) {
                addData();
            },
            function fail(sender, args) {
                console.log("App initialization failed");
            });
    }

    function addData() {
        var productList = app.lists.getByTitle(app.listNames.product);

        var count = productList.get_itemCount();
        if (count == 0) {
            addSuppliers();
        } else {
            loadData();
        }
    }

    function loadSPObjects() {
        ///app.context.load(app.web);
        ///app.context.load(app.lists);
    }

    function createCategoryList() {
        var title = app.listNames.category;

        var xml =
            [
                '<Field Name="' + app.fields.category.id + '" DisplayName="' + app.fields.category.id + '" Type="Number"/>',
                '<Field Name="' + app.fields.category.name + '" DisplayName="' + app.fields.category.name + '" Type="Text"/>'
            ];

        createList(title, xml);
    }

    function createProductList() {
        var title = app.listNames.product;

        var xml =
            [
                '<Field Name="' + app.fields.product.id + '" DisplayName="' + app.fields.product.id + '" Type="Number"/>',
                '<Field Name="' + app.fields.product.name + '" DisplayName="' + app.fields.product.name + '" Type="Text"/>',
                '<Field Name="' + app.fields.product.supplierId + '" DisplayName="' + app.fields.product.supplierId + '" Type="Number"/>',
                '<Field Name="' + app.fields.product.categoryId + '" DisplayName="' + app.fields.product.categoryId + '" Type="Number"/>',
            ];

        createList(title, xml);
    }

    function createSupplierList() {
        var title = app.listNames.supplier;

        var xml =
            [
                '<Field Name="' + app.fields.supplier.id + '" DisplayName="' + app.fields.supplier.id + '" Type="Number"/>',
                '<Field Name="' + app.fields.supplier.companyName + '" DisplayName="' + app.fields.supplier.companyName + '" Type="Text"/>'
            ];

        createList(title, xml);
    }

    function createReviewList() {

        var hostWeb = app.hostContext.get_web();
        var reviewListInfo = new SP.ListCreationInformation();
        reviewListInfo.set_title(app.listNames.review);
        reviewListInfo.set_templateType(SP.ListTemplateType.genericList);

        hostWeb.get_lists().add(reviewListInfo);

        var list = hostWeb.get_lists().getByTitle(app.listNames.review);
        var xml =
            [
                '<Field Name="' + app.fields.review.productName + '" DisplayName="' + app.fields.review.productName + '" Type="Text"/>',
                '<Field Name="' + app.fields.review.companyName + '" DisplayName="' + app.fields.review.companyName + '" Type="Text"/>'
            ];
        var fields = list.get_fields();
        jQuery.each(xml, function (index, element) {
            fields.addFieldAsXml(element, true, SP.AddFieldOptions.defaultValue);
        });

    }

    function createList(title, fieldXmls, undefined) {
        if (typeof title == undefined) {
            return;
        }

        /// create List.
        var listInfo = new SP.ListCreationInformation();
        listInfo.set_title(title);
        listInfo.set_templateType(SP.ListTemplateType.genericList);
        app.lists.add(listInfo);

        /// Add Fields
        var list = app.lists.getByTitle(title);

        var fields = list.get_fields();
        jQuery.each(fieldXmls, function (index, element) {
            fields.addFieldAsXml(element, true, SP.AddFieldOptions.defaultValue);
        });
    }

    function createListInHost(title, fieldXmls, undefined) {
        if (typeof title == undefined) {
            return;
        }

        /// create List.
        var listInfo = new SP.ListCreationInformation();
        listInfo.set_title(title);
        listInfo.set_templateType(SP.ListTemplateType.genericList);
        app.hostContext.get_web().get_lists().add(listInfo);

        /// Add Fields
        var list = app.hostContext.get_web().get_lists().getByTitle(title);

        var fields = list.get_fields();
        jQuery.each(fieldXmls, function (index, element) {
            fields.addFieldAsXml(element, true, SP.AddFieldOptions.defaultValue);
        });
    }

    function addCategories() {
        var title = app.listNames.category;
        var list = app.lists.getByTitle(title);

        var requestInfo = new SP.WebRequestInfo();
        requestInfo.set_method(app.requestMethod);
        //requestInfo.set_headers({ "Accept": "application/json;odata=verbose" });
        requestInfo.set_url(app.url.category);
        var response = SP.WebProxy.invoke(app.context, requestInfo);

        app.context.executeQueryAsync(
            function sucess() {
                var code = response.get_statusCode();
                if (code == app.successCode) {
                    var catagoryData = JSON.parse(response.get_body());

                    jQuery.each(catagoryData.value, function (index, data) {
                        addCategory(list, data);
                    });
                    addProducts();
                }
            },
            function fail(data) {
                console.error("Could not recive category info");
            });

    }

    function addCategory(list, data) {
        var itemInfo = new SP.ListItemCreationInformation();
        var item = list.addItem(itemInfo);
        item.set_item(app.fields.category.id, data.CategoryID);
        item.set_item(app.fields.category.name, data.CategoryName);
        item.update();
    }

    function addProducts() {
        var title = app.listNames.product;
        var list = app.lists.getByTitle(title);

        var requestInfo = new SP.WebRequestInfo();
        requestInfo.set_method(app.requestMethod);
        //requestInfo.set_headers({ "Accept": "application/json;odata=verbose" });
        requestInfo.set_url(app.url.product);
        var response = SP.WebProxy.invoke(app.context, requestInfo);

        app.context.executeQueryAsync(
            function sucess() {
                if (response.get_statusCode() == app.successCode) {
                    var catagoryData = JSON.parse(response.get_body());

                    jQuery.each(catagoryData.value, function (index, data) {
                        addProduct(list, data);
                    });

                    execute(
                        function sucess() {
                            loadData();
                        },
                        function fail() {
                            console.log('adding data failed');
                        });
                }
            },
            function fail() {
                console.error("Could not recive Product info");
            });

    }

    function addProduct(list, data) {
        var itemInfo = new SP.ListItemCreationInformation();
        var item = list.addItem(itemInfo);
        item.set_item(app.fields.product.id, data.ProductID);
        item.set_item(app.fields.product.name, data.ProductName);
        item.set_item(app.fields.product.supplierId, data.SupplierID);
        item.set_item(app.fields.product.categoryId, data.CategoryID);
        item.update();
    }

    function addSuppliers() {
        var title = app.listNames.supplier;
        var list = app.lists.getByTitle(title);

        var requestInfo = new SP.WebRequestInfo();
        requestInfo.set_method(app.requestMethod);
        //requestInfo.set_headers({ "Accept": "application/json;odata=verbose" });
        requestInfo.set_url(app.url.supplier);
        var response = SP.WebProxy.invoke(app.context, requestInfo);

        app.context.executeQueryAsync(
            function sucess() {
                if (response.get_statusCode() == app.successCode) {
                    var catagoryData = JSON.parse(response.get_body());

                    jQuery.each(catagoryData.value, function (index, data) {
                        addSupplier(list, data);
                    });

                    addCategories();
                }
            },
            function fail() {
                console.error("Could not recive Supplier info");
            });

    }

    function addSupplier(list, data) {
        var itemInfo = new SP.ListItemCreationInformation();
        var item = list.addItem(itemInfo);
        ///item.set_item("Title", data.CompanyName);
        item.set_item(app.fields.supplier.id, data.SupplierID);
        item.set_item(app.fields.supplier.companyName, data.CompanyName);
        item.update();
    }

    function loadData() {
        loadSuppliers();
    }

    function loadSuppliers() {
        loadList(
            app.listNames.supplier,
            [
                app.fields.supplier.id,
                app.fields.supplier.companyName
            ],
            loadCategories);

    }

    function loadCategories() {
        loadList(
            app.listNames.category,
            [
                app.fields.category.id,
                app.fields.category.name
            ],
            loadProducts);
    }

    function loadProducts() {
        loadList(
            app.listNames.product,
            [
                app.fields.product.id,
                app.fields.product.name,
                app.fields.product.categoryId,
                app.fields.product.supplierId
            ], draw);
    }

    function loadList(title, fields, onSuccess) {
        var listItems = [];
        var list = app.lists.getByTitle(title);
        var query = new SP.CamlQuery();
        query.set_viewXml("<view/>");

        var items = list.getItems(query);
        app.context.load(items, include(fields));

        execute(
            function sucess() {
                var count = items.get_count();
                app.data[title] = [];
                for (var i = 0; i < count; i++) {
                    var item = items.itemAt(i);
                    var values = item.get_fieldValues();
                    listItems.push(values);

                    app.data[title].push(values);
                }

                onSuccess();
            },
            function fail() {
                console.log("Could not load " + title);
            });
    }

    function draw() {
        app.data.all = [];
        for (var i = 0; i < app.data.Product.length; i++) {
            var product = app.data.Product[i];

            var supplierName = Enumerable.From(app.data.Supplier).Where(function (s) {
                return s[app.fields.supplier.id] == product[app.fields.product.supplierId];
            }).Select(function (s) {
                return s[app.fields.supplier.companyName];
            }).Single();

            var categoryName = Enumerable.From(app.data.Category).Where(function (c) {
                return c[app.fields.category.id] == product[app.fields.product.categoryId];
            }).Select(function (s) {
                return s[app.fields.category.name];
            }).Single();

            viewModel.rows.push(
                {
                    id: product[app.fields.product.id],
                    productName: product[app.fields.product.name],
                    supplierName: supplierName,
                    categoryName: categoryName
                });


            app.data.all.push(
                {
                    id: product[app.fields.product.id],
                    productName: product[app.fields.product.name],
                    supplierName: supplierName,
                    categoryName: categoryName
                });
        }

        jQuery("#loading").hide();
    }

    function drawFiltered(items) {
        viewModel.rows.removeAll();
        _.each(items, function (item) {
            viewModel.rows.push(item);
        });
    }

    function getCategoryNameById(id) {
        var category = _.where(app.data.Category, { 'CategoryID': id });
        return category;
    }

    function getSupplierNameById(id) {
        var supplier = _.where(app.data.Supplier, { 'SupplierID': id });
        return supplier;
    }

    function include(titles) {

        var statement = "Include(";

        jQuery.each(titles, function (index, element) {
            if (index !== 0) {
                statement += ",";
                statement += element;
            } else {
                statement += element;
            }
        });

        statement += ")";

        return statement;
    }

    function execute(success, fail) {
        app.context.executeQueryAsync(success, fail);
    }

    function executeSilent() {
        app.context.executeQueryAsync(function (data) {
            console.log("Successfully Executed.");
        }, function (data) {
            console.error("Execution Failed.");
        });
    }

    function executeInHost(sucess, fail) {
        app.context.executeQueryAsync(sucess, fail);
    }

    app.search = function (evt) {

        var key = jQuery("#search_text").val();
        if (key === "") {
            alert('Please Enter a seach value');
            drawFiltered(app.data.all);
        } else {
            var criteria = jQuery("#search_option").val();
            if (jQuery("#search_online").is(':checked')) {
                searchOnline(criteria, key);
            } else {
                searchByCriteria(criteria, key);
            }
        }
        evt.preventDefault();
        console.log("Seaching...");
    }

    function searchOnline(criteria, key) {

        var items = [];
        key = key.toLowerCase();
        if (app.listNames.product === criteria) {
            var products = app.lists.getByTitle(app.listNames.product);
            var query = new SP.CamlQuery();
            var xml = new CamlBuilder()
                            .View()
                            .Query()
                            .Where()
                            .TextField(app.fields.product.name)
                            .BeginsWith(key)
                            .ToString();
            query.set_viewXml(xml);
            items = products.getItems(query);
            app.context.load(items, include([
                app.fields.product.id,
                app.fields.product.name,
                app.fields.product.categoryId,
                app.fields.product.supplierId
            ]));

            execute(sucess, fail);

        } else if (app.listNames.category === criteria) {
            var categories = app.lists.getByTitle(app.listNames.category);
            var query = new SP.CamlQuery();
            var xml = new CamlBuilder()
                            .View()
                            .Query()
                            .Where()
                            .TextField(app.fields.category.name)
                            .BeginsWith(key)
                            .ToString();
            query.set_viewXml(xml);
            var categoryItems = categories.getItems(query);
            app.context.load(categoryItems, include([
                app.fields.category.id,
                app.fields.category.name
            ]));

            execute(
                function () {
                    var itemCount = categoryItems.get_count();

                    var ids = [];
                    for (var i = 0; i < itemCount; i++) {
                        var category = categoryItems.itemAt(i);
                        var values = category.get_fieldValues();
                        ids.push(values[app.fields.category.id]);
                    }

                    query = new SP.CamlQuery();
                    xml = new CamlBuilder().View().Query().Where().IntegerField(app.fields.product.categoryId).In(ids).ToString();
                    query.set_viewXml(xml);

                    var products = app.lists.getByTitle(app.listNames.product);

                    query.set_viewXml(xml);
                    items = products.getItems(query);
                    app.context.load(items, include([
                        app.fields.product.id,
                        app.fields.product.name,
                        app.fields.product.categoryId,
                        app.fields.product.supplierId
                    ]));

                    execute(sucess, fail);

                }, fail);
        } else if (app.listNames.supplier === criteria) {
            var suppliers = app.lists.getByTitle(app.listNames.supplier);
            var query = new SP.CamlQuery();
            var xml = new CamlBuilder()
                            .View()
                            .Query()
                            .Where()
                            .TextField(app.fields.supplier.companyName)
                            .BeginsWith(key)
                            .ToString();
            query.set_viewXml(xml);
            var supplierItems = suppliers.getItems(query);
            app.context.load(supplierItems, include([
                app.fields.supplier.id,
                app.fields.supplier.companyName
            ]));

            execute(
                function () {
                    var itemCount = supplierItems.get_count();

                    var ids = [];
                    for (var i = 0; i < itemCount; i++) {
                        var supplier = supplierItems.itemAt(i);
                        var values = supplier.get_fieldValues();
                        ids.push(values[app.fields.supplier.id]);
                    }

                    query = new SP.CamlQuery();
                    xml = new CamlBuilder().View().Query().Where().IntegerField(app.fields.product.supplierId).In(ids).ToString();
                    query.set_viewXml(xml);

                    var products = app.lists.getByTitle(app.listNames.product);

                    query.set_viewXml(xml);
                    items = products.getItems(query);
                    app.context.load(items, include([
                        app.fields.product.id,
                        app.fields.product.name,
                        app.fields.product.categoryId,
                        app.fields.product.supplierId
                    ]));

                    execute(sucess, fail);

                }, fail);
        }

        function sucess() {
            var displayItems = [];

            var count = items.get_count();
            for (var i = 0; i < count; i++) {
                var item = items.itemAt(i);
                var product = item.get_fieldValues();

                var supplierName = Enumerable.From(app.data.Supplier).Where(function (s) {
                    return s[app.fields.supplier.id] == product[app.fields.product.supplierId];
                }).Select(function (s) {
                    return s[app.fields.supplier.companyName];
                }).Single();

                var categoryName = Enumerable.From(app.data.Category).Where(function (c) {
                    return c[app.fields.category.id] == product[app.fields.product.categoryId];
                }).Select(function (s) {
                    return s[app.fields.category.name];
                }).Single();

                displayItems.push(
                    {
                        id: product[app.fields.product.id],
                        productName: product[app.fields.product.name],
                        supplierName: supplierName,
                        categoryName: categoryName
                    });
            }

            drawFiltered(displayItems);
        }

        function fail() {
            console.log("Could not load query results");
        };
    }

    function searchByCriteria(criteria, key) {
        var displayItems = [];
        key = key.toLowerCase();

        if (app.listNames.product === criteria) {

            displayItems = _.filter(app.data.all, function (item) {
                return item.productName.toLowerCase().startsWith(key);
            });

        } else if (app.listNames.supplier === criteria) {
            displayItems = _.filter(app.data.all, function (item) {
                return item.supplierName.toLowerCase().startsWith(key);
            });

        } else if (app.listNames.category === criteria) {
            displayItems = _.filter(app.data.all, function (item) {
                return item.categoryName.toLowerCase().startsWith(key);
            });
        }

        drawFiltered(displayItems);
    }

    app.review = function (evt) {
        evt.preventDefault();

        console.log("Review Started");
        var reviewItems = jQuery("input:checked");

        if (reviewItems.length === 0) {
            alert("Please select items to review..");
            return;
        }

        jQuery.each(reviewItems, function (index, element) {
            jQuery(element).prop('checked', false);
            var productId = jQuery(element).val();

            var review = Enumerable.From(app.data.all).Where(function (item) {
                return item.id == productId;
            }).Select(function (item) {
                return { productName: item.productName, supplierName: item.supplierName };
            }).Single();

            addReview(review.productName, review.supplierName);
        });

        executeInHost(
            function sucess() {
                alert("Reviews Created");
                console.log("Reviews Created");
            },
            function fail() {
                alert("Reviews creation failed");
                console.log("Reviews failed");
            });
    }

    function addReview(productName, companyName) {
        var list = app.hostContext.get_web().get_lists().getByTitle(app.listNames.review);
        var itemInfo = new SP.ListItemCreationInformation();
        var item = list.addItem(itemInfo);
        item.set_item(app.fields.review.companyName, companyName);
        item.set_item(app.fields.review.productName, productName);
        item.update();

    }

    function getQueryStringParameter(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
})(app);

jQuery(document).ready(function () {
    jQuery("#search_form").on("submit", app.search);
    jQuery("#search_btn").on("click", app.search);
    jQuery("#review_btn").on("click", app.review);
    app.init();
})
