<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script src="../Scripts/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.runtime.js"></script>
    <script type="text/javascript" src="/_layouts/15/sp.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Add your CSS styles to the following file -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />

    <script src="../Scripts/underscore-min.js"></script>

    <!-- Bootstrap -->
    <link href="../Content/bootstrap.min.css" rel="stylesheet" />
    <!-- Optional theme -->
    <link href="../Content/bootstrap-theme.min.css" rel="stylesheet" />
    <!-- Latest compiled and minified JavaScript -->
    <script src="../Scripts/bootstrap.min.js"></script>

    <script src="../Scripts/knockout-3.4.0.js"></script>
    <script src="../Scripts/linq.min.js"></script>
    <script src="../Scripts/camljs.js"></script>
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    Supplier System
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">

    <div class="container" style="margin-top: 60px">
        <div class="row"></div>
        <div class="row clearfix">
            <div class="col-md-12-">
                <form id="search_form" class="form-inline" action="javascript:alert( 'success!' );">
                    <div class="">
                        <div class="form-group col-md-4">
                            <select id="search_option" class="form-control">
                                <option value="Product">Product Name</option>
                                <option value="Supplier">Company Name</option>
                                <option value="Category">Category Name</option>
                            </select>
                        </div>
                        <div class="form-group col-md-4">
                            <input type="text" name="search" id="search_text" class="form-control" placeholder="Search" required />
                        </div>
                        <div class="form-group col-md-2">
                            <label for="search_online"><input type="checkbox" id="search_online" /> Online</label>
                            
                        </div>
                        <div class="form-group col-md-2">
                            <input id="search_btn" type="button" class="btn btn-default" value="Search" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <div class="row">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>Product Name</th>
                        <th>Company Name</th>
                        <th>Category Name</th>
                    </tr>
                </thead>
                <tbody data-bind="foreach: rows">
                    <tr>
                        <td><input type="checkbox" data-bind="value:id" ></td>
                        <td data-bind="text: productName"></td>
                        <td data-bind="text: supplierName"></td>
                        <td data-bind="text: categoryName"></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="loading" class="lead">
            Loading...
        </div>
        <div class="row">
            <input type="button" class="btn btn-default pull-right" id="review_btn" value="Review" />
        </div>
    </div>
        <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="../Scripts/App.js"></script>
</asp:Content>
